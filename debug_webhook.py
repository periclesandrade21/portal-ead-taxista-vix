#!/usr/bin/env python3
"""
Debug webhook database update issue
"""

import requests
import json

BACKEND_URL = "https://ead-taxi.preview.emergentagent.com/api"

# Test webhook with debug data
webhook_data = {
    "id": "evt_debug_test",
    "event": "PAYMENT_RECEIVED",
    "dateCreated": "2025-09-19 15:05:29",
    "payment": {
        "object": "payment",
        "id": "pay_debug_test_12345",
        "customer": {"email": "jose.silva@gmail.com"},
        "value": 99.99,
        "billingType": "PIX",
        "status": "RECEIVED"
    }
}

print("Sending debug webhook...")
response = requests.post(
    f"{BACKEND_URL}/webhook/asaas-payment",
    json=webhook_data,
    headers={"Content-Type": "application/json"},
    timeout=10
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Check user after webhook
print("\nChecking user after webhook...")
subscriptions_response = requests.get(f"{BACKEND_URL}/subscriptions", timeout=10)
subscriptions = subscriptions_response.json()

for user in subscriptions:
    if user.get('email') == 'jose.silva@gmail.com':
        print(f"User: {user.get('name')}")
        print(f"Email: {user.get('email')}")
        print(f"Status: {user.get('status')}")
        print(f"Payment ID: {user.get('payment_id')}")
        print(f"Payment Value: {user.get('payment_value')}")
        print(f"Customer ID: {user.get('asaas_customer_id')}")
        print(f"Payment Confirmed At: {user.get('payment_confirmed_at')}")
        print(f"Course Access: {user.get('course_access')}")
        break