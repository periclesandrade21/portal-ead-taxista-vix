"""
Moodle Integration Service
Handles business logic for Moodle integration with EAD platform
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
from motor.motor_asyncio import AsyncIOMotorCollection
from .moodle_client import MoodleAPIClient, MoodleUser, MoodleCourse
import hashlib
import secrets
import logging
import uuid

class MoodleIntegrationService:
    def __init__(
        self, 
        moodle_client: MoodleAPIClient,
        db
    ):
        self.moodle = moodle_client
        self.db = db
        self.logger = logging.getLogger(__name__)

    async def sync_user_to_moodle(
        self, 
        user_id: str, 
        force_update: bool = False
    ) -> Dict[str, Any]:
        """Synchronize platform user to Moodle"""
        try:
            # Get user from platform database
            platform_user = await self.db.subscriptions.find_one({"_id": user_id})
            if not platform_user:
                return {"success": False, "error": f"User {user_id} not found"}

            # Create username from email (ensure uniqueness)
            username = platform_user['email'].split('@')[0]
            username = f"{username}_{user_id[:8]}"  # Add unique suffix

            # Check if user exists in Moodle
            moodle_user = await self.moodle.get_user_by_email(platform_user['email'])
            
            if moodle_user and not force_update:
                # Update platform user with Moodle ID
                await self.db.subscriptions.update_one(
                    {"_id": user_id},
                    {"$set": {"moodle_user_id": moodle_user['id']}}
                )
                return {
                    "success": True,
                    "moodle_user_id": moodle_user['id'],
                    "action": "existing_user_linked"
                }

            # Split name into first and last name
            name_parts = platform_user.get('name', '').split()
            firstname = name_parts[0] if name_parts else 'Aluno'
            lastname = ' '.join(name_parts[1:]) if len(name_parts) > 1 else 'EAD'

            # Create or update user in Moodle
            moodle_user_data = MoodleUser(
                username=username,
                email=platform_user['email'],
                firstname=firstname,
                lastname=lastname,
                password=self._generate_secure_password(),
                idnumber=str(user_id),
                auth='manual'
            )

            if not moodle_user:
                # Create new user
                result = await self.moodle.create_user(moodle_user_data)
                moodle_user_id = result.get('id')
                action = "user_created"
            else:
                # Update existing user
                moodle_user_id = moodle_user['id']
                action = "user_updated"

            # Store Moodle user ID in platform
            await self.db.subscriptions.update_one(
                {"_id": user_id},
                {
                    "$set": {
                        "moodle_user_id": moodle_user_id,
                        "moodle_synced_at": datetime.utcnow(),
                        "moodle_username": username
                    }
                }
            )

            self.logger.info(f"User {user_id} synced to Moodle with ID {moodle_user_id}")
            return {
                "success": True,
                "moodle_user_id": moodle_user_id,
                "action": action,
                "username": username
            }

        except Exception as e:
            self.logger.error(f"Error syncing user {user_id} to Moodle: {e}")
            return {"success": False, "error": str(e)}

    async def check_course_access(
        self, 
        user_id: str, 
        course_id: str = "default"
    ) -> Dict[str, Any]:
        """Check if user has paid access to course"""
        try:
            # Get user subscription data
            user = await self.db.subscriptions.find_one({"_id": user_id})
            if not user:
                return {"has_access": False, "reason": "User not found"}

            # Check payment status
            if user.get('status') == 'paid':
                return {
                    "has_access": True,
                    "status": "paid",
                    "course_access": user.get('course_access', 'granted')
                }
            else:
                return {
                    "has_access": False,
                    "reason": "Payment required",
                    "status": user.get('status', 'pending')
                }

        except Exception as e:
            self.logger.error(f"Error checking course access: {e}")
            return {"has_access": False, "reason": "System error"}

    async def enroll_user_in_course(
        self, 
        user_id: str, 
        course_id: str = "default",
        check_payment: bool = True
    ) -> Dict[str, Any]:
        """Enroll user in Moodle course based on payment status"""
        try:
            # Verify payment if required
            if check_payment:
                access_check = await self.check_course_access(user_id, course_id)
                if not access_check["has_access"]:
                    return {
                        "success": False,
                        "error": access_check["reason"],
                        "status": access_check.get("status")
                    }

            # Ensure user is synced to Moodle
            sync_result = await self.sync_user_to_moodle(user_id)
            if not sync_result["success"]:
                return {
                    "success": False,
                    "error": f"Failed to sync user: {sync_result['error']}"
                }

            moodle_user_id = sync_result["moodle_user_id"]

            # Get or create default course
            moodle_course = await self.get_or_create_default_course()
            if not moodle_course:
                return {
                    "success": False,
                    "error": "Failed to get/create default course"
                }

            moodle_course_id = moodle_course["id"]

            # Enroll in Moodle
            await self.moodle.enroll_user_in_course(
                user_id=moodle_user_id,
                course_id=moodle_course_id,
                role_id=5  # Student role
            )
            
            # Update enrollment record in platform
            await self.db.subscriptions.update_one(
                {"_id": user_id},
                {
                    "$set": {
                        "moodle_enrolled": True,
                        "moodle_course_id": moodle_course_id,
                        "enrolled_at": datetime.utcnow()
                    }
                }
            )
            
            self.logger.info(f"User {user_id} enrolled in Moodle course {moodle_course_id}")
            return {
                "success": True,
                "enrolled": True,
                "moodle_user_id": moodle_user_id,
                "moodle_course_id": moodle_course_id
            }
            
        except Exception as e:
            self.logger.error(f"Error enrolling user {user_id}: {e}")
            return {"success": False, "error": str(e)}

    async def unenroll_user_from_course(
        self, 
        user_id: str, 
        course_id: str = "default"
    ) -> Dict[str, Any]:
        """Remove user enrollment from course"""
        try:
            user = await self.db.subscriptions.find_one({"_id": user_id})
            if not user:
                return {"success": False, "error": "User not found"}

            moodle_user_id = user.get("moodle_user_id")
            moodle_course_id = user.get("moodle_course_id")
            
            if moodle_user_id and moodle_course_id:
                await self.moodle.unenroll_user_from_course(
                    moodle_user_id, moodle_course_id
                )
                
                # Update platform records
                await self.db.subscriptions.update_one(
                    {"_id": user_id},
                    {
                        "$set": {
                            "moodle_enrolled": False,
                            "unenrolled_at": datetime.utcnow()
                        }
                    }
                )
                
                self.logger.info(f"User {user_id} unenrolled from Moodle course")
                return {"success": True, "unenrolled": True}

            return {"success": False, "error": "User not enrolled in Moodle"}

        except Exception as e:
            self.logger.error(f"Error unenrolling user {user_id}: {e}")
            return {"success": False, "error": str(e)}

    async def get_or_create_default_course(self) -> Optional[Dict[str, Any]]:
        """Get or create the default EAD course in Moodle"""
        try:
            # Try to find existing course
            courses = await self.moodle.get_courses()
            default_course = None
            
            for course in courses:
                if course.get('shortname') == 'ead-taxista-es':
                    default_course = course
                    break
            
            if default_course:
                return default_course

            # Create default course
            course_data = MoodleCourse(
                fullname="Curso EAD para Taxistas - Espírito Santo",
                shortname="ead-taxista-es",
                categoryid=1,
                summary="Curso completo de educação à distância para taxistas do Espírito Santo, incluindo módulos de Relações Humanas, Direção Defensiva, Primeiros Socorros e Mecânica Básica.",
                format="topics",
                visible=1
            )
            
            result = await self.moodle.create_course(course_data)
            self.logger.info(f"Created default course with ID: {result.get('id')}")
            return result

        except Exception as e:
            self.logger.error(f"Error getting/creating default course: {e}")
            return None

    async def manage_course_access_by_payment(
        self, 
        user_id: str,
        payment_status: str
    ) -> Dict[str, Any]:
        """Manage course enrollment based on payment status changes"""
        try:
            if payment_status == "paid":
                # Grant access
                result = await self.enroll_user_in_course(
                    user_id, check_payment=False
                )
                action = "enrolled"
            elif payment_status in ["cancelled", "refunded", "expired"]:
                # Revoke access
                result = await self.unenroll_user_from_course(user_id)
                action = "unenrolled"
            else:
                return {"success": True, "action": "no_change"}

            result["action"] = action
            return result

        except Exception as e:
            self.logger.error(f"Error managing course access: {e}")
            return {"success": False, "error": str(e)}

    async def get_user_course_progress(
        self, 
        user_id: str
    ) -> Dict[str, Any]:
        """Get user's course progress from Moodle"""
        try:
            user = await self.db.subscriptions.find_one({"_id": user_id})
            if not user:
                return {"success": False, "error": "User not found"}

            moodle_user_id = user.get("moodle_user_id")
            moodle_course_id = user.get("moodle_course_id")
            
            if not moodle_user_id or not moodle_course_id:
                return {
                    "success": False,
                    "error": "User not enrolled in Moodle"
                }

            # Get course completion status
            completion = await self.moodle.check_user_course_completion(
                moodle_user_id, moodle_course_id
            )

            # Get course contents and activities
            contents = await self.moodle.get_course_contents(moodle_course_id)

            return {
                "success": True,
                "user_id": user_id,
                "moodle_user_id": moodle_user_id,
                "course_id": moodle_course_id,
                "completion": completion,
                "contents": contents,
                "progress_percentage": self._calculate_progress_percentage(completion, contents)
            }

        except Exception as e:
            self.logger.error(f"Error getting course progress: {e}")
            return {"success": False, "error": str(e)}

    def _calculate_progress_percentage(
        self, 
        completion: Dict[str, Any], 
        contents: List[Dict[str, Any]]
    ) -> float:
        """Calculate course progress percentage"""
        try:
            if completion.get("completed"):
                return 100.0
            
            # Simple calculation based on available data
            # In a real implementation, you'd analyze the completion criteria
            return 0.0
            
        except Exception:
            return 0.0

    def _generate_secure_password(self) -> str:
        """Generate secure password for Moodle users"""
        return secrets.token_urlsafe(12)

    async def test_moodle_integration(self) -> Dict[str, Any]:
        """Test the Moodle integration"""
        try:
            # Test connection
            connection_test = await self.moodle.test_connection()
            if not connection_test["success"]:
                return {
                    "success": False,
                    "error": "Moodle connection failed",
                    "details": connection_test
                }

            # Test course creation/retrieval
            course_test = await self.get_or_create_default_course()
            if not course_test:
                return {
                    "success": False,
                    "error": "Failed to get/create default course"
                }

            return {
                "success": True,
                "message": "Moodle integration test passed",
                "connection": connection_test,
                "default_course": {
                    "id": course_test.get("id"),
                    "name": course_test.get("fullname")
                }
            }

        except Exception as e:
            self.logger.error(f"Integration test failed: {e}")
            return {"success": False, "error": str(e)}