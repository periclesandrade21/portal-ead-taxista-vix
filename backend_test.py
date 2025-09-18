#!/usr/bin/env python3
"""
Backend Test Suite for EAD Taxista ES - Chat Bot System
Testing the new chat bot implementation and related endpoints
"""

import requests
import json
import uuid
import time
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env
BACKEND_URL = "https://driversedu.preview.emergentagent.com/api"

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

def test_health_check():
    """Test basic health check endpoint"""
    print_test_header("Health Check")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Health check passed: {data.get('status', 'unknown')}")
            print_info(f"Service: {data.get('service', 'unknown')}")
            return True
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Health check failed with exception: {str(e)}")
        return False

def test_chat_normal_message():
    """Test chat endpoint with normal message"""
    print_test_header("Chat Bot - Normal Message")
    
    session_id = str(uuid.uuid4())
    test_message = "Olá! Quais são os cursos disponíveis para taxistas?"
    
    try:
        payload = {
            "session_id": session_id,
            "message": test_message
        }
        
        response = requests.post(
            f"{BACKEND_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Chat endpoint responded successfully")
            print_info(f"Session ID: {data.get('session_id')}")
            print_info(f"Response: {data.get('response', '')[:100]}...")
            
            # Check if response is in Portuguese and mentions courses
            response_text = data.get('response', '').lower()
            if any(word in response_text for word in ['curso', 'taxista', 'treinamento', 'módulo']):
                print_success("Response contains relevant course information")
            else:
                print_warning("Response may not contain expected course information")
                
            return True, session_id
        else:
            print_error(f"Chat failed with status {response.status_code}: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Chat request failed: {str(e)}")
        return False, None

def test_chat_value_question():
    """Test chat endpoint with value/price question"""
    print_test_header("Chat Bot - Value Question Detection")
    
    session_id = str(uuid.uuid4())
    test_message = "Quanto custa o curso? Qual é o preço do treinamento?"
    
    try:
        payload = {
            "session_id": session_id,
            "message": test_message
        }
        
        response = requests.post(
            f"{BACKEND_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', '')
            
            expected_response = "Os valores do treinamento serão divulgados em breve"
            
            if expected_response in response_text:
                print_success("Value question correctly detected and handled")
                print_info(f"Response: {response_text}")
                return True
            else:
                print_error("Value question not handled correctly")
                print_info(f"Expected: {expected_response}")
                print_info(f"Got: {response_text}")
                return False
        else:
            print_error(f"Chat failed with status {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Chat request failed: {str(e)}")
        return False

def test_chat_password_reset():
    """Test chat endpoint with password reset request"""
    print_test_header("Chat Bot - Password Reset Detection")
    
    session_id = str(uuid.uuid4())
    test_message = "Esqueci minha senha, como posso resetar?"
    
    try:
        payload = {
            "session_id": session_id,
            "message": test_message
        }
        
        response = requests.post(
            f"{BACKEND_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', '').lower()
            
            # Check if response mentions password reset process
            reset_keywords = ['resetar', 'senha', 'email', 'link', 'recuperação']
            if any(keyword in response_text for keyword in reset_keywords):
                print_success("Password reset request correctly detected and handled")
                print_info(f"Response contains reset instructions")
                return True
            else:
                print_error("Password reset request not handled correctly")
                print_info(f"Response: {data.get('response', '')}")
                return False
        else:
            print_error(f"Chat failed with status {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Chat request failed: {str(e)}")
        return False

def test_chat_history(session_id):
    """Test chat history endpoint"""
    print_test_header("Chat History Retrieval")
    
    if not session_id:
        print_warning("No session ID available, skipping history test")
        return False
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/chat/{session_id}/history",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Chat history retrieved successfully")
            print_info(f"Found {len(data)} messages in history")
            
            if len(data) > 0:
                print_info(f"Latest message: {data[-1].get('user_message', '')[:50]}...")
                return True
            else:
                print_warning("No messages found in history")
                return False
        else:
            print_error(f"Chat history failed with status {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Chat history request failed: {str(e)}")
        return False

def test_password_reset_endpoint():
    """Test password reset endpoint"""
    print_test_header("Password Reset Endpoint")
    
    test_email = "taxista.teste@sindtaxi-es.org"
    
    try:
        payload = {
            "email": test_email,
            "contact_method": "email"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/password-reset",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Password reset endpoint responded successfully")
            print_info(f"Status: {data.get('status')}")
            print_info(f"Message: {data.get('message')}")
            return True
        else:
            print_error(f"Password reset failed with status {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Password reset request failed: {str(e)}")
        return False

def test_llm_integration():
    """Test LLM integration by asking a complex question"""
    print_test_header("LLM Integration Test")
    
    session_id = str(uuid.uuid4())
    test_message = "Explique detalhadamente sobre o curso de Direção Defensiva para taxistas"
    
    try:
        payload = {
            "session_id": session_id,
            "message": test_message
        }
        
        response = requests.post(
            f"{BACKEND_URL}/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=45  # Longer timeout for LLM
        )
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get('response', '')
            
            # Check if response is substantial and relevant
            if len(response_text) > 100 and any(word in response_text.lower() for word in ['direção', 'defensiva', 'segurança', 'trânsito']):
                print_success("LLM integration working - received detailed response")
                print_info(f"Response length: {len(response_text)} characters")
                return True
            else:
                print_warning("LLM may not be working properly - response too short or irrelevant")
                print_info(f"Response: {response_text}")
                return False
        else:
            print_error(f"LLM test failed with status {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"LLM test request failed: {str(e)}")
        return False

def test_session_isolation():
    """Test that different sessions are isolated"""
    print_test_header("Session Isolation Test")
    
    session1 = str(uuid.uuid4())
    session2 = str(uuid.uuid4())
    
    try:
        # Send message to session 1
        payload1 = {
            "session_id": session1,
            "message": "Meu nome é João Silva"
        }
        
        response1 = requests.post(
            f"{BACKEND_URL}/chat",
            json=payload1,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        # Send message to session 2
        payload2 = {
            "session_id": session2,
            "message": "Qual é o meu nome?"
        }
        
        response2 = requests.post(
            f"{BACKEND_URL}/chat",
            json=payload2,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response1.status_code == 200 and response2.status_code == 200:
            # Check session 1 history
            history1 = requests.get(f"{BACKEND_URL}/chat/{session1}/history")
            history2 = requests.get(f"{BACKEND_URL}/chat/{session2}/history")
            
            if history1.status_code == 200 and history2.status_code == 200:
                h1_data = history1.json()
                h2_data = history2.json()
                
                # Session 1 should have João Silva message, session 2 should not
                session1_messages = [msg.get('user_message', '') for msg in h1_data]
                session2_messages = [msg.get('user_message', '') for msg in h2_data]
                
                if any('João Silva' in msg for msg in session1_messages) and not any('João Silva' in msg for msg in session2_messages):
                    print_success("Session isolation working correctly")
                    return True
                else:
                    print_error("Session isolation may not be working")
                    return False
            else:
                print_error("Could not retrieve session histories for isolation test")
                return False
        else:
            print_error("Failed to send messages for isolation test")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Session isolation test failed: {str(e)}")
        return False

def test_existing_endpoints():
    """Test that existing endpoints still work"""
    print_test_header("Existing Endpoints Verification")
    
    endpoints_to_test = [
        ("/", "GET"),
        ("/health", "GET"),
        ("/admin/stats", "GET")
    ]
    
    results = []
    
    for endpoint, method in endpoints_to_test:
        try:
            if method == "GET":
                response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                print_success(f"{method} {endpoint} - Working")
                results.append(True)
            else:
                print_error(f"{method} {endpoint} - Failed ({response.status_code})")
                results.append(False)
                
        except requests.exceptions.RequestException as e:
            print_error(f"{method} {endpoint} - Exception: {str(e)}")
            results.append(False)
    
    return all(results)

def run_all_tests():
    """Run all tests and provide summary"""
    print(f"{Colors.BOLD}EAD TAXISTA ES - CHAT BOT SYSTEM TESTING{Colors.ENDC}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = {}
    
    # Run all tests
    test_results['health_check'] = test_health_check()
    test_results['chat_normal'], session_id = test_chat_normal_message()
    test_results['chat_values'] = test_chat_value_question()
    test_results['chat_password_reset'] = test_chat_password_reset()
    test_results['chat_history'] = test_chat_history(session_id)
    test_results['password_reset_endpoint'] = test_password_reset_endpoint()
    test_results['llm_integration'] = test_llm_integration()
    test_results['session_isolation'] = test_session_isolation()
    test_results['existing_endpoints'] = test_existing_endpoints()
    
    # Print summary
    print_test_header("TEST SUMMARY")
    
    passed = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "PASS" if result else "FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{status:>6}{Colors.ENDC} - {test_name.replace('_', ' ').title()}")
    
    print(f"\n{Colors.BOLD}OVERALL RESULT: {passed}/{total} tests passed{Colors.ENDC}")
    
    if passed == total:
        print_success("All tests passed! Chat bot system is working correctly.")
        return True
    else:
        print_error(f"{total - passed} tests failed. Chat bot system needs attention.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)