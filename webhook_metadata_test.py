#!/usr/bin/env python3
"""
Webhook Metadata Storage Fix Test - Specific test for the corrected webhook
Testing the real Asaas data to confirm metadata storage fix is working
"""

import requests
import json
import uuid
import time
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env
BACKEND_URL = "https://ead-taxi.preview.emergentagent.com/api"

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

def test_webhook_metadata_storage_fix():
    """Test the corrected webhook with real Asaas data to confirm metadata storage fix"""
    print_test_header("🔍 WEBHOOK METADATA STORAGE FIX - Real Asaas Data Test")
    
    # Use unique timestamp to avoid duplicates
    timestamp = str(int(time.time()))
    
    test_data = {
        "name": f"Webhook Test User {timestamp}",
        "email": f"webhook.test.{timestamp}@email.com",
        "phone": f"2799{timestamp[-7:]}",  # Use timestamp for unique phone
        "cpf": "11144477735",  # Valid CPF for testing
        "carPlate": f"WHK-{timestamp[-4:]}-T",
        "licenseNumber": f"TA-{timestamp[-5:]}",
        "city": "Vitória",
        "lgpd_consent": True
    }
    
    try:
        # 1. Create test subscription
        print_info("Step 1: Creating test subscription...")
        response = requests.post(
            f"{BACKEND_URL}/subscribe",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code != 200:
            print_error(f"Failed to create test subscription: {response.status_code} - {response.text}")
            return False
        
        subscription_data = response.json()
        test_email = test_data["email"]
        print_success(f"Test subscription created: {test_email}")
        
        # 2. Send real Asaas webhook data as specified in review request
        print_info("Step 2: Sending real Asaas webhook data...")
        
        real_webhook_data = {
            "id": "evt_d26e303b238e509335ac9ba210e51b0f&1064917030",
            "event": "PAYMENT_RECEIVED",
            "dateCreated": "2025-09-18 15:05:29",
            "payment": {
                "object": "payment",
                "id": "pay_2zg8sti32jdr0v04",
                "customer": "cus_000130254085",
                "value": 60.72,
                "billingType": "PIX",
                "status": "RECEIVED"
            }
        }
        
        print_info("Real webhook data details:")
        print_info(f"  Event: {real_webhook_data['event']}")
        print_info(f"  Payment ID: {real_webhook_data['payment']['id']}")
        print_info(f"  Customer ID: {real_webhook_data['payment']['customer']}")
        print_info(f"  Value: R$ {real_webhook_data['payment']['value']}")
        print_info(f"  Billing Type: {real_webhook_data['payment']['billingType']}")
        print_info(f"  Status: {real_webhook_data['payment']['status']}")
        
        webhook_response = requests.post(
            f"{BACKEND_URL}/webhook/asaas-payment",
            json=real_webhook_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if webhook_response.status_code != 200:
            print_error(f"Webhook failed with status {webhook_response.status_code}: {webhook_response.text}")
            return False
        
        webhook_result = webhook_response.json()
        print_success("✅ Webhook processed successfully")
        print_info(f"Webhook response: {webhook_result}")
        
        # 3. Verify the response includes all expected fields
        print_info("Step 3: Verifying webhook response fields...")
        
        response_tests = []
        
        # Check user_name field
        user_name = webhook_result.get('user_name')
        if user_name:
            print_success(f"✅ user_name: {user_name}")
            response_tests.append(True)
        else:
            print_error("❌ Missing user_name in response")
            response_tests.append(False)
        
        # Check payment_id field
        payment_id = webhook_result.get('payment_id')
        expected_payment_id = "pay_2zg8sti32jdr0v04"
        if payment_id == expected_payment_id:
            print_success(f"✅ payment_id: {payment_id}")
            response_tests.append(True)
        else:
            print_error(f"❌ payment_id: {payment_id} (expected {expected_payment_id})")
            response_tests.append(False)
        
        # Check customer_id field
        customer_id = webhook_result.get('customer_id')
        expected_customer_id = "cus_000130254085"
        if customer_id == expected_customer_id:
            print_success(f"✅ customer_id: {customer_id}")
            response_tests.append(True)
        else:
            print_error(f"❌ customer_id: {customer_id} (expected {expected_customer_id})")
            response_tests.append(False)
        
        # Check value field
        value = webhook_result.get('value')
        expected_value = 60.72
        if value == expected_value:
            print_success(f"✅ value: {value}")
            response_tests.append(True)
        else:
            print_error(f"❌ value: {value} (expected {expected_value})")
            response_tests.append(False)
        
        # 4. Test with modified webhook data using our test email to actually update a user
        print_info("Step 4: Testing webhook with modified data using test email...")
        
        # Modify the webhook data to use our test email for actual subscription update
        modified_webhook_data = real_webhook_data.copy()
        modified_webhook_data['payment'] = real_webhook_data['payment'].copy()
        modified_webhook_data['payment']['customer'] = {"email": test_email}
        
        modified_response = requests.post(
            f"{BACKEND_URL}/webhook/asaas-payment",
            json=modified_webhook_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if modified_response.status_code != 200:
            print_error(f"Modified webhook failed: {modified_response.status_code}")
            return False
        
        modified_result = modified_response.json()
        print_success("✅ Modified webhook data processed successfully")
        print_info(f"Modified webhook response: {modified_result}")
        
        # 5. Verify metadata is stored in database
        print_info("Step 5: Verifying metadata storage in database...")
        
        # Get all subscriptions to find the updated user
        subscriptions_response = requests.get(f"{BACKEND_URL}/subscriptions", timeout=10)
        
        if subscriptions_response.status_code != 200:
            print_error(f"Failed to fetch subscriptions: {subscriptions_response.status_code}")
            return False
        
        subscriptions = subscriptions_response.json()
        updated_user = None
        
        # Find our test user
        for sub in subscriptions:
            if sub.get('email') == test_email:
                updated_user = sub
                break
        
        if not updated_user:
            print_error("❌ Test user not found in database")
            return False
        
        print_success(f"✅ Found updated user: {updated_user.get('name')} ({updated_user.get('email')})")
        
        # 6. Verify all metadata fields are stored
        print_info("Step 6: Verifying all metadata fields are stored...")
        
        metadata_tests = []
        
        # Check asaas_customer_id
        stored_customer_id = updated_user.get('asaas_customer_id')
        expected_customer_id = "cus_000130254085"
        if stored_customer_id == expected_customer_id:
            print_success(f"✅ asaas_customer_id stored: {stored_customer_id}")
            metadata_tests.append(True)
        else:
            print_error(f"❌ asaas_customer_id: {stored_customer_id} (expected {expected_customer_id})")
            metadata_tests.append(False)
        
        # Check payment_id
        stored_payment_id = updated_user.get('payment_id')
        expected_payment_id = "pay_2zg8sti32jdr0v04"
        if stored_payment_id == expected_payment_id:
            print_success(f"✅ payment_id stored: {stored_payment_id}")
            metadata_tests.append(True)
        else:
            print_error(f"❌ payment_id: {stored_payment_id} (expected {expected_payment_id})")
            metadata_tests.append(False)
        
        # Check payment_value
        stored_payment_value = updated_user.get('payment_value')
        expected_value = 60.72
        if stored_payment_value == expected_value:
            print_success(f"✅ payment_value stored: {stored_payment_value}")
            metadata_tests.append(True)
        else:
            print_error(f"❌ payment_value: {stored_payment_value} (expected {expected_value})")
            metadata_tests.append(False)
        
        # Check payment_confirmed_at
        payment_confirmed_at = updated_user.get('payment_confirmed_at')
        if payment_confirmed_at:
            print_success(f"✅ payment_confirmed_at stored: {payment_confirmed_at}")
            metadata_tests.append(True)
        else:
            print_error("❌ payment_confirmed_at not stored")
            metadata_tests.append(False)
        
        # Check status updated to paid
        user_status = updated_user.get('status')
        if user_status == 'paid':
            print_success(f"✅ status updated to: {user_status}")
            metadata_tests.append(True)
        else:
            print_error(f"❌ status: {user_status} (expected 'paid')")
            metadata_tests.append(False)
        
        # Check course_access granted
        course_access = updated_user.get('course_access')
        if course_access == 'granted':
            print_success(f"✅ course_access set to: {course_access}")
            metadata_tests.append(True)
        else:
            print_error(f"❌ course_access: {course_access} (expected 'granted')")
            metadata_tests.append(False)
        
        # Overall assessment
        all_response_tests_passed = all(response_tests)
        all_metadata_tests_passed = all(metadata_tests)
        overall_success = all_response_tests_passed and all_metadata_tests_passed
        
        if overall_success:
            print_success("🎉 WEBHOOK METADATA STORAGE FIX VERIFIED!")
            print_success("✅ Real Asaas webhook data processed successfully")
            print_success("✅ All metadata properly stored in database")
            print_success("✅ Response includes all expected fields")
            print_success("✅ User status and course access updated correctly")
        else:
            print_error("❌ Webhook metadata storage fix has issues")
            if not all_response_tests_passed:
                print_error("❌ Response field issues detected")
            if not all_metadata_tests_passed:
                print_error("❌ Database metadata storage issues detected")
        
        return overall_success
        
    except requests.exceptions.RequestException as e:
        print_error(f"Webhook metadata storage test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print(f"{Colors.BOLD}WEBHOOK METADATA STORAGE FIX TEST{Colors.ENDC}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    success = test_webhook_metadata_storage_fix()
    
    print_test_header("TEST SUMMARY")
    
    if success:
        print_success("🎉 WEBHOOK METADATA STORAGE FIX TEST PASSED!")
        print_success("✅ The webhook processes real Asaas data successfully")
        print_success("✅ Metadata (asaas_customer_id, payment_id, payment_value) is properly stored")
        print_success("✅ Updated user has all webhook information stored")
        print_success("✅ Response includes all expected fields (user_name, payment_id, customer_id, value)")
        print_success("✅ Webhook metadata storage fix is working correctly")
    else:
        print_error("❌ WEBHOOK METADATA STORAGE FIX TEST FAILED!")
        print_error("❌ Issues found with webhook processing or metadata storage")
        print_error("❌ The fix may not be working as expected")
    
    print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    sys.exit(0 if success else 1)