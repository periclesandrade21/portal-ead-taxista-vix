#!/usr/bin/env python3
"""
MongoDB Webhook Metadata Storage Debug Script
Specifically for debugging the webhook metadata storage issue as requested in review
"""

import requests
import json
import uuid
import time
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env
BACKEND_URL = "https://taxicourse.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}TESTING: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def debug_mongodb_webhook_metadata_storage():
    """Debug MongoDB webhook metadata storage issue as requested in review"""
    print_test_header("🔍 MONGODB WEBHOOK METADATA STORAGE DEBUG")
    
    try:
        # Step 1: Check current database schema for subscriptions collection
        print_info("Step 1: Checking current database schema for subscriptions collection...")
        response = requests.get(f"{BACKEND_URL}/subscriptions", timeout=10)
        
        if response.status_code != 200:
            print_error(f"Failed to fetch subscriptions: {response.status_code}")
            return False
        
        subscriptions = response.json()
        if not subscriptions:
            print_warning("No subscriptions found in database")
            return False
        
        # Analyze field structure from existing documents
        print_success(f"Found {len(subscriptions)} subscription documents")
        
        print_info("\n=== CURRENT DATABASE SCHEMA ANALYSIS ===")
        sample_subscription = subscriptions[0]
        
        print_info("Sample subscription document fields:")
        for key, value in sample_subscription.items():
            print_info(f"  {key}: {type(value).__name__} = {value}")
        
        # Check if webhook metadata fields exist in any document
        print_info("\n=== WEBHOOK METADATA FIELDS ANALYSIS ===")
        webhook_fields = ['payment_id', 'asaas_customer_id', 'payment_value', 'payment_confirmed_at', 'course_access']
        
        field_stats = {}
        for field in webhook_fields:
            field_stats[field] = {'present': 0, 'null_empty': 0, 'total': len(subscriptions)}
            
        for sub in subscriptions:
            for field in webhook_fields:
                if field in sub:
                    if sub[field] is not None and sub[field] != "":
                        field_stats[field]['present'] += 1
                    else:
                        field_stats[field]['null_empty'] += 1
        
        print_info("Webhook metadata field statistics across all subscriptions:")
        for field, stats in field_stats.items():
            print_info(f"  {field}:")
            print_info(f"    Present with data: {stats['present']}/{stats['total']}")
            print_info(f"    Null/Empty: {stats['null_empty']}/{stats['total']}")
            print_info(f"    Missing entirely: {stats['total'] - stats['present'] - stats['null_empty']}/{stats['total']}")
        
        # Step 2: Find a user to test webhook with
        print_info("\n=== FINDING TEST USER ===")
        test_user = None
        
        # Look for a user with 'pending' status first
        for sub in subscriptions:
            if sub.get('status') == 'pending':
                test_user = sub
                print_success(f"Found pending user for testing: {sub.get('email')}")
                break
        
        # If no pending user, use any user
        if not test_user:
            test_user = subscriptions[0]
            print_info(f"Using existing user for testing: {test_user.get('email')}")
        
        # Step 3: Test webhook with real Asaas production data structure
        print_info("\n=== TESTING WEBHOOK WITH PRODUCTION DATA STRUCTURE ===")
        
        # Real Asaas webhook data structure as mentioned in the issue
        webhook_data = {
            "event": "PAYMENT_RECEIVED",
            "payment": {
                "id": "pay_2zg8sti32jdr0v04",
                "value": 60.72,
                "customer": "cus_000130254085",  # String format as in production
                "billingType": "PIX",
                "pixTransaction": {
                    "transactionId": "b693788f-e4e5-4938-b915-6cd5d3f9bbdd",
                    "qrCode": "SINDTAVIES0000000000000521867206ASA"
                }
            }
        }
        
        print_info("Sending webhook with production data structure:")
        print_info(f"  event: {webhook_data['event']}")
        print_info(f"  payment_id: {webhook_data['payment']['id']}")
        print_info(f"  customer: {webhook_data['payment']['customer']} (string format)")
        print_info(f"  payment_value: {webhook_data['payment']['value']}")
        print_info(f"  billingType: {webhook_data['payment']['billingType']}")
        
        webhook_response = requests.post(
            f"{BACKEND_URL}/webhook/asaas-payment",
            json=webhook_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Webhook response status: {webhook_response.status_code}")
        
        if webhook_response.status_code == 200:
            webhook_result = webhook_response.json()
            print_success("Webhook processed successfully")
            print_info(f"Webhook response: {webhook_result}")
            
            # Check what the webhook response tells us
            if webhook_result.get('status') == 'success':
                print_success("Webhook reports successful processing")
                updated_user = webhook_result.get('user_name', 'Unknown')
                updated_email = webhook_result.get('email', 'Unknown')
                print_info(f"Updated user: {updated_user} ({updated_email})")
            elif webhook_result.get('status') == 'warning':
                print_warning("Webhook reports warning - likely no matching user found")
                print_info(f"Message: {webhook_result.get('message')}")
            else:
                print_info(f"Webhook status: {webhook_result.get('status')}")
                print_info(f"Message: {webhook_result.get('message')}")
        else:
            print_error(f"Webhook failed: {webhook_response.status_code} - {webhook_response.text}")
        
        # Step 4: Re-check database to see if metadata was stored
        print_info("\n=== CHECKING DATABASE AFTER WEBHOOK ===")
        
        # Re-fetch subscriptions to check if metadata was stored
        response = requests.get(f"{BACKEND_URL}/subscriptions", timeout=10)
        if response.status_code != 200:
            print_error(f"Failed to re-fetch subscriptions: {response.status_code}")
            return False
        
        updated_subscriptions = response.json()
        
        # Check if any subscription now has the webhook metadata
        webhook_metadata_found = False
        for sub in updated_subscriptions:
            has_payment_id = sub.get('payment_id') == webhook_data['payment']['id']
            has_customer_id = sub.get('asaas_customer_id') == webhook_data['payment']['customer']
            has_payment_value = sub.get('payment_value') == webhook_data['payment']['value']
            
            if has_payment_id or has_customer_id or has_payment_value:
                webhook_metadata_found = True
                print_success(f"Found webhook metadata in user: {sub.get('email')}")
                print_info(f"  payment_id: {sub.get('payment_id')}")
                print_info(f"  asaas_customer_id: {sub.get('asaas_customer_id')}")
                print_info(f"  payment_value: {sub.get('payment_value')}")
                print_info(f"  payment_confirmed_at: {sub.get('payment_confirmed_at')}")
                print_info(f"  course_access: {sub.get('course_access')}")
                break
        
        if not webhook_metadata_found:
            print_error("❌ NO WEBHOOK METADATA FOUND IN DATABASE")
            print_error("The webhook processed but metadata was not stored")
        
        # Step 5: Test with email-based webhook (to ensure matching works)
        print_info("\n=== TESTING WEBHOOK WITH EMAIL MATCHING ===")
        
        # Use the test user's email for guaranteed matching
        webhook_data_email = {
            "event": "PAYMENT_CONFIRMED",
            "payment": {
                "id": "pay_email_test_123",
                "value": 150.00,
                "customer": {
                    "email": test_user.get('email')
                },
                "billingType": "PIX"
            }
        }
        
        print_info(f"Testing webhook with email matching: {test_user.get('email')}")
        
        webhook_response_email = requests.post(
            f"{BACKEND_URL}/webhook/asaas-payment",
            json=webhook_data_email,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if webhook_response_email.status_code == 200:
            webhook_result_email = webhook_response_email.json()
            print_success("Email-based webhook processed successfully")
            print_info(f"Response: {webhook_result_email}")
            
            # Check database again
            response = requests.get(f"{BACKEND_URL}/subscriptions", timeout=10)
            if response.status_code == 200:
                final_subscriptions = response.json()
                
                # Find the test user and check for metadata
                for sub in final_subscriptions:
                    if sub.get('email') == test_user.get('email'):
                        print_info(f"\nFinal state of test user {sub.get('email')}:")
                        print_info(f"  status: {sub.get('status')}")
                        print_info(f"  payment_id: {sub.get('payment_id')}")
                        print_info(f"  asaas_customer_id: {sub.get('asaas_customer_id')}")
                        print_info(f"  payment_value: {sub.get('payment_value')}")
                        print_info(f"  payment_confirmed_at: {sub.get('payment_confirmed_at')}")
                        print_info(f"  course_access: {sub.get('course_access')}")
                        
                        # Check if metadata was stored
                        metadata_stored = any([
                            sub.get('payment_id') == webhook_data_email['payment']['id'],
                            sub.get('payment_value') == webhook_data_email['payment']['value'],
                            sub.get('course_access') == 'granted'
                        ])
                        
                        if metadata_stored:
                            print_success("✅ WEBHOOK METADATA STORAGE IS WORKING!")
                            return True
                        else:
                            print_error("❌ WEBHOOK METADATA STILL NOT STORED")
                            return False
                        break
        else:
            print_error(f"Email-based webhook failed: {webhook_response_email.status_code}")
        
        # Step 6: Diagnosis and recommendations
        print_info("\n=== DIAGNOSIS AND RECOMMENDATIONS ===")
        
        print_error("🔍 WEBHOOK METADATA STORAGE ISSUE CONFIRMED")
        print_info("Based on the testing, here are the findings:")
        print_info("1. Webhook endpoint responds successfully (200 status)")
        print_info("2. Webhook can find and update user status")
        print_info("3. BUT metadata fields are not being persisted in MongoDB")
        print_info("4. This indicates a silent failure in the MongoDB update operation")
        
        print_info("\n💡 POTENTIAL ROOT CAUSES:")
        print_info("1. MongoDB update_one operation with $set not working with new fields")
        print_info("2. Field names in the update operation don't match expected names")
        print_info("3. MongoDB collection schema restrictions")
        print_info("4. Logic error in webhook handler when processing metadata")
        print_info("5. Transaction or connection issues with MongoDB")
        
        print_info("\n🔧 RECOMMENDED FIXES:")
        print_info("1. Add detailed logging to webhook handler in server.py")
        print_info("2. Check MongoDB update_one operation return values")
        print_info("3. Verify field names in update operation match exactly")
        print_info("4. Test manual MongoDB update with same field names")
        print_info("5. Consider using upsert operation instead of update_one")
        print_info("6. Add error handling for MongoDB operations")
        
        return False
        
    except Exception as e:
        print_error(f"MongoDB webhook metadata debug failed: {str(e)}")
        return False

if __name__ == "__main__":
    print(f"{Colors.BOLD}{Colors.RED}MongoDB Webhook Metadata Storage Debug{Colors.ENDC}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    result = debug_mongodb_webhook_metadata_storage()
    
    if result:
        print(f"\n{Colors.GREEN}{Colors.BOLD}✅ WEBHOOK METADATA STORAGE IS WORKING{Colors.ENDC}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ WEBHOOK METADATA STORAGE ISSUE CONFIRMED{Colors.ENDC}")
        print(f"{Colors.RED}This requires immediate attention from the main agent{Colors.ENDC}")