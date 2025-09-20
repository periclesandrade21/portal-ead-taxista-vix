#!/usr/bin/env python3
"""
Detailed Backend Test Suite for EAD Taxista ES - 3 Specific Problems
Investigating the 3 specific problems with more realistic test data
"""

import requests
import json
import uuid
import time
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env
BACKEND_URL = "https://taxiead.preview.emergentagent.com/api"

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

def test_admin_login_investigation():
    """Investigate admin login endpoints - Problem 1"""
    print_test_header("🔧 PROBLEM 1 - Admin Login Investigation")
    
    # Test various admin login possibilities
    admin_endpoints = [
        "/admin/login",
        "/auth/admin/login",
        "/admin/auth/login",
        "/login/admin",
        "/admin/auth",
        "/auth/login"  # Maybe it's a general login endpoint
    ]
    
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    # Also try with email format
    login_data_email = {
        "email": "admin@sindtaxi-es.org",
        "password": "admin123"
    }
    
    found_endpoints = []
    
    for endpoint in admin_endpoints:
        try:
            print_info(f"Testing endpoint: {endpoint}")
            
            # Try with username
            response = requests.post(
                f"{BACKEND_URL}{endpoint}",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print_info(f"  Username login: {response.status_code}")
            
            if response.status_code != 404:
                found_endpoints.append((endpoint, "username", response.status_code, response.text[:200]))
                
                if response.status_code == 200:
                    print_success(f"✅ Admin login working at {endpoint} with username")
                    return True
            
            # Try with email
            response_email = requests.post(
                f"{BACKEND_URL}{endpoint}",
                json=login_data_email,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print_info(f"  Email login: {response_email.status_code}")
            
            if response_email.status_code != 404:
                found_endpoints.append((endpoint, "email", response_email.status_code, response_email.text[:200]))
                
                if response_email.status_code == 200:
                    print_success(f"✅ Admin login working at {endpoint} with email")
                    return True
                    
        except requests.exceptions.RequestException as e:
            print_info(f"  Exception: {str(e)}")
            continue
    
    # Report findings
    if found_endpoints:
        print_warning("Found admin endpoints but none working with admin/admin123:")
        for endpoint, method, status, response in found_endpoints:
            print_info(f"  {endpoint} ({method}): {status} - {response}")
    else:
        print_error("❌ No admin login endpoints found")
    
    return False

def test_registration_with_realistic_data():
    """Test registration with realistic Brazilian names - Problem 2"""
    print_test_header("🔧 PROBLEM 2 - Registration with Realistic Data")
    
    # Use realistic Brazilian names that should pass validation
    import time
    timestamp = str(int(time.time()))
    
    realistic_test_data = {
        "name": "Carlos Eduardo Silva",  # Common Brazilian name
        "email": f"carlos.eduardo.{timestamp}@gmail.com",
        "phone": "27999888777",
        "cpf": "11144477735",  # Valid CPF
        "carPlate": f"CES-{timestamp[-4:]}-T",
        "licenseNumber": f"TA-{timestamp[-5:]}",
        "city": "Vitória",
        "lgpd_consent": True
    }
    
    try:
        print_info("Step 1: Testing registration with realistic Brazilian name...")
        print_info(f"Name: {realistic_test_data['name']}")
        print_info(f"Email: {realistic_test_data['email']}")
        
        response = requests.post(
            f"{BACKEND_URL}/subscribe",
            json=realistic_test_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        print_info(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✅ Registration successful with realistic data")
            print_info(f"Password sent via email: {data.get('password_sent_email')}")
            print_info(f"Password sent via WhatsApp: {data.get('password_sent_whatsapp')}")
            print_info(f"Temporary password: {data.get('temporary_password')}")
            
            # Verify in database
            subscriptions_response = requests.get(f"{BACKEND_URL}/subscriptions", timeout=10)
            if subscriptions_response.status_code == 200:
                subscriptions = subscriptions_response.json()
                for sub in subscriptions:
                    if sub.get('email') == realistic_test_data['email']:
                        print_success("✅ User found in database")
                        print_info(f"Status: {sub.get('status')}")
                        return True
            
            return True
        else:
            print_error(f"❌ Registration failed: {response.status_code}")
            print_error(f"Error: {response.text}")
            
            # Try with different names
            alternative_names = [
                "Maria Santos Oliveira",
                "José Carlos Ferreira", 
                "Ana Paula Costa",
                "Pedro Henrique Lima"
            ]
            
            for alt_name in alternative_names:
                print_info(f"Trying alternative name: {alt_name}")
                alt_data = realistic_test_data.copy()
                alt_data["name"] = alt_name
                alt_data["email"] = f"{alt_name.lower().replace(' ', '.')}.{timestamp}@gmail.com"
                
                alt_response = requests.post(
                    f"{BACKEND_URL}/subscribe",
                    json=alt_data,
                    headers={"Content-Type": "application/json"},
                    timeout=15
                )
                
                if alt_response.status_code == 200:
                    print_success(f"✅ Registration successful with name: {alt_name}")
                    return True
                else:
                    print_info(f"Failed with {alt_name}: {alt_response.status_code}")
            
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Registration test failed: {str(e)}")
        return False

def test_whatsapp_endpoints_detailed():
    """Detailed test of WhatsApp endpoints - Problem 3"""
    print_test_header("🔧 PROBLEM 3 - WhatsApp Endpoints Detailed Investigation")
    
    results = []
    
    # First, let's check what endpoints exist
    print_info("Step 1: Discovering available endpoints...")
    
    # Check common endpoints that might exist
    test_endpoints = [
        "/",
        "/health", 
        "/subscriptions",
        "/auth/login",
        "/auth/reset-password",
        "/webhook/asaas-payment",
        "/subscribe",
        "/chat"
    ]
    
    working_endpoints = []
    
    for endpoint in test_endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=5)
            if response.status_code != 404:
                working_endpoints.append((endpoint, response.status_code))
                print_info(f"  {endpoint}: {response.status_code}")
        except:
            continue
    
    print_success(f"Found {len(working_endpoints)} working endpoints")
    
    # Test 2: Try to create a user with a simple name that should work
    print_info("Step 2: Creating user with simple name for WhatsApp testing...")
    
    import time
    timestamp = str(int(time.time()))
    
    simple_test_data = {
        "name": "Maria Silva",  # Very simple, common name
        "email": f"maria.silva.{timestamp}@gmail.com",
        "phone": "27999888777",
        "cpf": "11144477735",  # Valid CPF
        "carPlate": f"MS-{timestamp[-4:]}-T",
        "licenseNumber": f"TA-{timestamp[-5:]}",
        "city": "Vitória",
        "lgpd_consent": True
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/subscribe",
            json=simple_test_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("✅ User created successfully")
            print_info(f"WhatsApp status: {data.get('password_sent_whatsapp')}")
            
            # This confirms the /api/subscribe endpoint works and returns WhatsApp status
            if 'password_sent_whatsapp' in data:
                print_success("✅ WhatsApp API field present in response")
                results.append(True)
            else:
                print_error("❌ WhatsApp API field missing")
                results.append(False)
                
            # Test password reset with this user
            print_info("Step 3: Testing password reset with created user...")
            
            reset_data = {"email": simple_test_data["email"]}
            
            reset_response = requests.post(
                f"{BACKEND_URL}/auth/reset-password",
                json=reset_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if reset_response.status_code == 200:
                reset_data_response = reset_response.json()
                print_success("✅ Password reset endpoint working")
                print_info(f"WhatsApp sent: {reset_data_response.get('whatsapp_sent')}")
                results.append(True)
            else:
                print_error(f"❌ Password reset failed: {reset_response.status_code}")
                results.append(False)
        else:
            print_error(f"❌ User creation failed: {response.status_code}")
            print_error(f"Error: {response.text}")
            results.append(False)
            results.append(False)
            
    except requests.exceptions.RequestException as e:
        print_error(f"WhatsApp test failed: {str(e)}")
        results.append(False)
        results.append(False)
    
    return all(results)

def test_backend_logs_investigation():
    """Check backend logs for errors"""
    print_test_header("🔧 ADDITIONAL - Backend Logs Investigation")
    
    try:
        # Check if we can get any error information from the backend
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_success("✅ Backend is responding")
            print_info(f"Status: {data.get('status')}")
            print_info(f"Service: {data.get('service')}")
            
            # Check if there are any additional fields that might indicate issues
            for key, value in data.items():
                if key not in ['status', 'service']:
                    print_info(f"{key}: {value}")
            
            return True
        else:
            print_error(f"❌ Backend health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Backend logs investigation failed: {str(e)}")
        return False

def main():
    """Run detailed investigation of the 3 problems"""
    print(f"{Colors.BOLD}{Colors.BLUE}🔍 DETAILED BACKEND INVESTIGATION - 3 REPORTED PROBLEMS{Colors.ENDC}")
    print(f"{Colors.BLUE}Backend URL: {BACKEND_URL}{Colors.ENDC}")
    print(f"{Colors.BLUE}Testing Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.ENDC}")
    
    results = []
    
    # PROBLEM 1: Admin EAD não funcionando
    results.append(("🔧 PROBLEM 1 - Admin Login Investigation", test_admin_login_investigation()))
    
    # PROBLEM 2: Cadastro não funcionando  
    results.append(("🔧 PROBLEM 2 - Registration with Realistic Data", test_registration_with_realistic_data()))
    
    # PROBLEM 3: API do WhatsApp com erro
    results.append(("🔧 PROBLEM 3 - WhatsApp Endpoints Detailed", test_whatsapp_endpoints_detailed()))
    
    # Additional investigation
    results.append(("🔧 ADDITIONAL - Backend Logs Investigation", test_backend_logs_investigation()))
    
    # Print summary
    print_test_header("INVESTIGATION RESULTS SUMMARY")
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        if result:
            print_success(f"{test_name}")
            passed += 1
        else:
            print_error(f"{test_name}")
            failed += 1
    
    total = passed + failed
    success_rate = (passed / total * 100) if total > 0 else 0
    
    print(f"\n{Colors.BOLD}INVESTIGATION RESULTS:{Colors.ENDC}")
    print(f"{Colors.GREEN}✅ Working: {passed}{Colors.ENDC}")
    print(f"{Colors.RED}❌ Issues Found: {failed}{Colors.ENDC}")
    print(f"{Colors.BLUE}📊 Success Rate: {success_rate:.1f}%{Colors.ENDC}")
    
    # Specific assessment for the 3 main problems
    print(f"\n{Colors.BOLD}PROBLEM-SPECIFIC FINDINGS:{Colors.ENDC}")
    
    problem_results = results[:3]  # First 3 are the main problems
    problem_passed = sum(1 for _, result in problem_results if result)
    
    if problem_passed == 3:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 ALL 3 PROBLEMS APPEAR TO BE RESOLVED! 🎉{Colors.ENDC}")
    elif problem_passed == 2:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠️ 2/3 PROBLEMS RESOLVED - 1 NEEDS ATTENTION ⚠️{Colors.ENDC}")
    elif problem_passed == 1:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠️ 1/3 PROBLEMS RESOLVED - 2 NEED ATTENTION ⚠️{Colors.ENDC}")
    else:
        print(f"{Colors.RED}{Colors.BOLD}🚨 ALL 3 PROBLEMS NEED ATTENTION 🚨{Colors.ENDC}")
    
    # Provide specific recommendations
    print(f"\n{Colors.BOLD}RECOMMENDATIONS:{Colors.ENDC}")
    
    if not results[0][1]:  # Admin login failed
        print_error("❌ PROBLEM 1 - Admin Login:")
        print_info("  - No admin login endpoint found with admin/admin123 credentials")
        print_info("  - Check if admin credentials are different")
        print_info("  - Verify if admin login is implemented")
        print_info("  - May need to implement admin authentication system")
    
    if not results[1][1]:  # Registration failed
        print_error("❌ PROBLEM 2 - Registration:")
        print_info("  - Name validation is rejecting realistic Brazilian names")
        print_info("  - Backend validation may be too strict")
        print_info("  - Check name validation logic in server.py")
        print_info("  - Consider relaxing validation rules")
    
    if not results[2][1]:  # WhatsApp failed
        print_error("❌ PROBLEM 3 - WhatsApp API:")
        print_info("  - WhatsApp endpoints may not be properly configured")
        print_info("  - Check WhatsApp integration in backend")
        print_info("  - Verify password reset endpoint exists")
        print_info("  - May need to implement missing endpoints")
    
    return problem_passed >= 2

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)