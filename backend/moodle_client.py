"""
Moodle API Client for EAD Platform Integration
Provides comprehensive interface for Moodle web services
"""

import httpx
import asyncio
import logging
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import os

class MoodleUser(BaseModel):
    id: Optional[int] = None
    username: str
    email: str
    firstname: str
    lastname: str
    password: Optional[str] = None
    auth: str = "manual"
    idnumber: Optional[str] = None
    lang: str = "pt_br"
    timezone: str = "America/Sao_Paulo"

class MoodleCourse(BaseModel):
    id: Optional[int] = None
    fullname: str
    shortname: str
    categoryid: int = 1
    idnumber: Optional[str] = None
    summary: Optional[str] = ""
    summaryformat: int = 1
    format: str = "topics"
    visible: int = 1

class MoodleAPIClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.api_url = f"{base_url}/webservice/rest/server.php"
        self.logger = logging.getLogger(__name__)
        
    async def _make_request(
        self, 
        function: str, 
        params: Dict[str, Any],
        timeout: int = 30
    ) -> Dict[str, Any]:
        """Make authenticated request to Moodle API"""
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                data = {
                    'wstoken': self.token,
                    'wsfunction': function,
                    'moodlewsrestformat': 'json',
                    **params
                }
                
                self.logger.info(f"Making Moodle API request: {function}")
                response = await client.post(self.api_url, data=data)
                response.raise_for_status()
                
                result = response.json()
                
                if isinstance(result, dict) and 'exception' in result:
                    raise Exception(f"Moodle API Error: {result.get('message', 'Unknown error')}")
                    
                self.logger.info(f"Moodle API response received for: {function}")
                return result
                
        except httpx.RequestError as e:
            self.logger.error(f"Request error: {e}")
            raise Exception(f"Failed to connect to Moodle API: {e}")
        except Exception as e:
            self.logger.error(f"API error: {e}")
            raise

    async def test_connection(self) -> Dict[str, Any]:
        """Test connection to Moodle API"""
        try:
            result = await self._make_request('core_webservice_get_site_info', {})
            return {
                "success": True,
                "site_name": result.get('sitename', ''),
                "version": result.get('release', ''),
                "connected": True
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "connected": False
            }

    async def create_user(self, user: MoodleUser) -> Dict[str, Any]:
        """Create a new user in Moodle"""
        params = {
            'users[0][username]': user.username,
            'users[0][email]': user.email,
            'users[0][firstname]': user.firstname,
            'users[0][lastname]': user.lastname,
            'users[0][auth]': user.auth,
            'users[0][lang]': user.lang,
            'users[0][timezone]': user.timezone,
        }
        
        if user.password:
            params['users[0][password]'] = user.password
        if user.idnumber:
            params['users[0][idnumber]'] = user.idnumber
            
        result = await self._make_request('core_user_create_users', params)
        return result[0] if isinstance(result, list) and result else result

    async def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        params = {
            'criteria[0][key]': 'username',
            'criteria[0][value]': username
        }
        
        result = await self._make_request('core_user_get_users', params)
        users = result.get('users', [])
        return users[0] if users else None

    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        params = {
            'criteria[0][key]': 'email',
            'criteria[0][value]': email
        }
        
        result = await self._make_request('core_user_get_users', params)
        users = result.get('users', [])
        return users[0] if users else None

    async def update_user(self, user_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update user information"""
        params = {
            'users[0][id]': user_id,
        }
        
        for key, value in updates.items():
            params[f'users[0][{key}]'] = value
            
        return await self._make_request('core_user_update_users', params)

    async def enroll_user_in_course(
        self, 
        user_id: int, 
        course_id: int, 
        role_id: int = 5,  # Student role
        timestart: Optional[int] = None,
        timeend: Optional[int] = None
    ) -> Dict[str, Any]:
        """Enroll user in course"""
        params = {
            'enrolments[0][roleid]': role_id,
            'enrolments[0][userid]': user_id,
            'enrolments[0][courseid]': course_id,
        }
        
        if timestart:
            params['enrolments[0][timestart]'] = timestart
        if timeend:
            params['enrolments[0][timeend]'] = timeend
            
        return await self._make_request('enrol_manual_enrol_users', params)

    async def unenroll_user_from_course(
        self, 
        user_id: int, 
        course_id: int
    ) -> Dict[str, Any]:
        """Unenroll user from course"""
        params = {
            'enrolments[0][userid]': user_id,
            'enrolments[0][courseid]': course_id,
        }
        
        return await self._make_request('enrol_manual_unenrol_users', params)

    async def get_user_courses(self, user_id: int) -> List[Dict[str, Any]]:
        """Get courses for a user"""
        params = {'userid': user_id}
        result = await self._make_request('core_enrol_get_users_courses', params)
        return result if isinstance(result, list) else []

    async def get_course_enrolled_users(self, course_id: int) -> List[Dict[str, Any]]:
        """Get enrolled users in a course"""
        params = {
            'courseid': course_id,
            'options[0][name]': 'withcapability',
            'options[0][value]': 'moodle/course:viewparticipants'
        }
        result = await self._make_request('core_enrol_get_enrolled_users', params)
        return result if isinstance(result, list) else []

    async def create_course(self, course: MoodleCourse) -> Dict[str, Any]:
        """Create a new course"""
        params = {
            'courses[0][fullname]': course.fullname,
            'courses[0][shortname]': course.shortname,
            'courses[0][categoryid]': course.categoryid,
            'courses[0][summary]': course.summary,
            'courses[0][summaryformat]': course.summaryformat,
            'courses[0][format]': course.format,
            'courses[0][visible]': course.visible,
        }
        
        if course.idnumber:
            params['courses[0][idnumber]'] = course.idnumber
            
        result = await self._make_request('core_course_create_courses', params)
        return result[0] if isinstance(result, list) and result else result

    async def get_courses(self) -> List[Dict[str, Any]]:
        """Get all courses"""
        result = await self._make_request('core_course_get_courses', {})
        return result if isinstance(result, list) else []

    async def get_course_by_id(self, course_id: int) -> Dict[str, Any]:
        """Get course by ID"""
        params = {
            'options[ids][0]': course_id
        }
        result = await self._make_request('core_course_get_courses', params)
        courses = result if isinstance(result, list) else []
        return courses[0] if courses else {}

    async def get_course_contents(self, course_id: int) -> List[Dict[str, Any]]:
        """Get course contents and structure"""
        params = {'courseid': course_id}
        result = await self._make_request('core_course_get_contents', params)
        return result if isinstance(result, list) else []

    async def check_user_course_completion(
        self, 
        user_id: int, 
        course_id: int
    ) -> Dict[str, Any]:
        """Check if user has completed the course"""
        try:
            params = {
                'courseid': course_id,
                'userid': user_id
            }
            result = await self._make_request('core_completion_get_course_completion_status', params)
            return result
        except Exception as e:
            self.logger.warning(f"Could not check completion status: {e}")
            return {"completed": False, "error": str(e)}

    async def get_course_completion_criteria(self, course_id: int) -> List[Dict[str, Any]]:
        """Get completion criteria for a course"""
        try:
            params = {'courseid': course_id}
            result = await self._make_request('core_completion_get_activities_completion_status', params)
            return result.get('statuses', []) if isinstance(result, dict) else []
        except Exception as e:
            self.logger.warning(f"Could not get completion criteria: {e}")
            return []


# Factory function to create Moodle client
def create_moodle_client() -> Optional[MoodleAPIClient]:
    """Create Moodle API client from environment variables"""
    moodle_url = os.getenv('MOODLE_API_URL')
    moodle_token = os.getenv('MOODLE_WS_TOKEN')
    
    if not moodle_url or not moodle_token:
        logging.warning("Moodle configuration not found in environment variables")
        return None
    
    return MoodleAPIClient(moodle_url, moodle_token)


# Test function
async def test_moodle_connection():
    """Test Moodle API connection"""
    client = create_moodle_client()
    if not client:
        print("❌ Moodle client not configured")
        return False
    
    try:
        result = await client.test_connection()
        if result["success"]:
            print(f"✅ Connected to Moodle: {result['site_name']} ({result['version']})")
            return True
        else:
            print(f"❌ Failed to connect to Moodle: {result['error']}")
            return False
    except Exception as e:
        print(f"❌ Error testing Moodle connection: {e}")
        return False


if __name__ == "__main__":
    # Test the connection
    asyncio.run(test_moodle_connection())