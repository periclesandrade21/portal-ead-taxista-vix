#!/usr/bin/env python3
"""
Webhook Investigation Script - Find users updated by real Asaas webhook
"""

import requests
import json

# Get backend URL from frontend .env
BACKEND_URL = "https://driveracad.preview.emergentagent.com/api"

def investigate_webhook_users():
    """Investigate which user was updated by the webhook and get their current status"""
    print("🔍 WEBHOOK INVESTIGATION - Finding Updated Users")
    print("=" * 60)
    
    try:
        # Get all subscriptions to investigate
        print("Step 1: Fetching all subscriptions to investigate webhook updates...")
        response = requests.get(f"{BACKEND_URL}/subscriptions", timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Failed to fetch subscriptions: {response.status_code}")
            return False
        
        subscriptions = response.json()
        print(f"✅ Found {len(subscriptions)} total subscriptions")
        
        print("\n=== DETAILED USER ANALYSIS ===")
        
        # Show all users with their complete data
        for i, user in enumerate(subscriptions, 1):
            print(f"\n--- USER {i} ---")
            print(f"Name: {user.get('name', 'N/A')}")
            print(f"Email: {user.get('email', 'N/A')}")
            print(f"Status: {user.get('status', 'N/A')}")
            print(f"Course Access: {user.get('course_access', 'N/A')}")
            print(f"Customer ID: {user.get('asaas_customer_id', 'N/A')}")
            print(f"Payment ID: {user.get('payment_id', 'N/A')}")
            print(f"Payment Value: {user.get('payment_value', 'N/A')}")
            print(f"Payment Confirmed At: {user.get('payment_confirmed_at', 'N/A')}")
            print(f"Created At: {user.get('created_at', 'N/A')}")
            
            # Check for any webhook-related fields
            webhook_fields = ['asaas_customer_id', 'payment_id', 'payment_value', 'payment_confirmed_at']
            has_webhook_data = any(user.get(field) for field in webhook_fields)
            
            if has_webhook_data:
                print(f"  ✅ USER {i} HAS WEBHOOK DATA")
            else:
                print(f"  ⚠️ USER {i} NO WEBHOOK DATA")
        
        # Look for specific patterns that might match the real webhook data
        print("\n=== SEARCHING FOR WEBHOOK PATTERNS ===")
        
        # 1. Look for users with specific asaas_customer_id "cus_000130254085"
        print("\nStep 2: Looking for users with asaas_customer_id 'cus_000130254085'...")
        target_customer_id = "cus_000130254085"
        customer_id_matches = []
        for sub in subscriptions:
            if sub.get('asaas_customer_id') == target_customer_id:
                customer_id_matches.append(sub)
        
        if customer_id_matches:
            print(f"✅ Found {len(customer_id_matches)} user(s) with customer ID '{target_customer_id}'")
            for user in customer_id_matches:
                print(f"  - User: {user.get('name')} ({user.get('email')})")
                print(f"    Status: {user.get('status')}")
                print(f"    Course Access: {user.get('course_access')}")
                print(f"    Payment ID: {user.get('payment_id')}")
                print(f"    Payment Value: {user.get('payment_value')}")
                print(f"    Payment Confirmed At: {user.get('payment_confirmed_at')}")
        else:
            print(f"⚠️ No users found with customer ID '{target_customer_id}'")
        
        # 2. Look for users with specific payment_id "pay_2zg8sti32jdr0v04"
        print("\nStep 3: Looking for users with payment_id 'pay_2zg8sti32jdr0v04'...")
        target_payment_id = "pay_2zg8sti32jdr0v04"
        payment_id_matches = []
        for sub in subscriptions:
            if sub.get('payment_id') == target_payment_id:
                payment_id_matches.append(sub)
        
        if payment_id_matches:
            print(f"✅ Found {len(payment_id_matches)} user(s) with payment ID '{target_payment_id}'")
            for user in payment_id_matches:
                print(f"  - User: {user.get('name')} ({user.get('email')})")
                print(f"    Status: {user.get('status')}")
                print(f"    Course Access: {user.get('course_access')}")
                print(f"    Customer ID: {user.get('asaas_customer_id')}")
                print(f"    Payment Value: {user.get('payment_value')}")
                print(f"    Payment Confirmed At: {user.get('payment_confirmed_at')}")
        else:
            print(f"⚠️ No users found with payment ID '{target_payment_id}'")
        
        # 3. Look for any customer IDs that start with "cus_"
        customer_id_users = []
        for user in subscriptions:
            customer_id = user.get('asaas_customer_id', '')
            if customer_id and customer_id.startswith('cus_'):
                customer_id_users.append(user)
        
        if customer_id_users:
            print(f"\n✅ Found {len(customer_id_users)} users with Asaas customer IDs:")
            for user in customer_id_users:
                print(f"  - {user.get('name')} ({user.get('email')}): {user.get('asaas_customer_id')}")
        
        # 4. Look for any payment IDs that start with "pay_"
        payment_id_users = []
        for user in subscriptions:
            payment_id = user.get('payment_id', '')
            if payment_id and payment_id.startswith('pay_'):
                payment_id_users.append(user)
        
        if payment_id_users:
            print(f"\n✅ Found {len(payment_id_users)} users with Asaas payment IDs:")
            for user in payment_id_users:
                print(f"  - {user.get('name')} ({user.get('email')}): {user.get('payment_id')}")
        
        # 5. Look for users with payment values around R$60.72 (from the real webhook)
        value_match_users = []
        target_value = 60.72
        for user in subscriptions:
            payment_value = user.get('payment_value')
            if payment_value and abs(float(payment_value) - target_value) < 1.0:  # Within R$1 of target
                value_match_users.append(user)
        
        if value_match_users:
            print(f"\n✅ Found {len(value_match_users)} users with payment values near R${target_value}:")
            for user in value_match_users:
                print(f"  - {user.get('name')} ({user.get('email')}): R${user.get('payment_value')}")
        
        # 6. Look for users with email containing "ana" and "lgpd" (from test results)
        ana_lgpd_users = []
        for user in subscriptions:
            email = user.get('email', '').lower()
            if 'ana' in email and 'lgpd' in email:
                ana_lgpd_users.append(user)
        
        if ana_lgpd_users:
            print(f"\n✅ Found {len(ana_lgpd_users)} users with 'ana' and 'lgpd' in email:")
            for user in ana_lgpd_users:
                print(f"  - {user.get('name')} ({user.get('email')})")
                print(f"    Status: {user.get('status')}")
                print(f"    Customer ID: {user.get('asaas_customer_id')}")
                print(f"    Payment ID: {user.get('payment_id')}")
                print(f"    Payment Value: {user.get('payment_value')}")
        
        # 7. Look for users with recent payment_confirmed_at timestamps
        print("\nStep 4: Looking for users with recent payment_confirmed_at timestamps...")
        recent_payments = []
        for sub in subscriptions:
            if sub.get('payment_confirmed_at'):
                recent_payments.append(sub)
        
        if recent_payments:
            print(f"✅ Found {len(recent_payments)} user(s) with payment_confirmed_at timestamps")
            # Sort by payment_confirmed_at (most recent first)
            recent_payments.sort(key=lambda x: x.get('payment_confirmed_at', ''), reverse=True)
            
            print("Most recent payment confirmations:")
            for i, user in enumerate(recent_payments[:5]):  # Show top 5 most recent
                print(f"  {i+1}. User: {user.get('name')} ({user.get('email')})")
                print(f"     Status: {user.get('status')}")
                print(f"     Course Access: {user.get('course_access')}")
                print(f"     Customer ID: {user.get('asaas_customer_id')}")
                print(f"     Payment ID: {user.get('payment_id')}")
                print(f"     Payment Value: {user.get('payment_value')}")
                print(f"     Payment Confirmed At: {user.get('payment_confirmed_at')}")
                print("")
        else:
            print("⚠️ No users found with payment_confirmed_at timestamps")
        
        print("\n=== INVESTIGATION SUMMARY ===")
        print(f"Total users analyzed: {len(subscriptions)}")
        print(f"Users with paid status: {len([u for u in subscriptions if u.get('status') == 'paid'])}")
        print(f"Users with customer IDs: {len(customer_id_users)}")
        print(f"Users with payment IDs: {len(payment_id_users)}")
        print(f"Users with payment values near R$60.72: {len(value_match_users)}")
        print(f"Users with 'ana.lgpd' pattern: {len(ana_lgpd_users)}")
        
        # Show the most likely candidate for webhook update
        if customer_id_matches or payment_id_matches:
            target_user = customer_id_matches[0] if customer_id_matches else payment_id_matches[0]
            print("\n🎯 MOST LIKELY WEBHOOK-UPDATED USER:")
            print(f"  Name: {target_user.get('name')}")
            print(f"  Email: {target_user.get('email')}")
            print(f"  Status: {target_user.get('status')}")
            print(f"  Course Access: {target_user.get('course_access')}")
            print(f"  Customer ID: {target_user.get('asaas_customer_id')}")
            print(f"  Payment ID: {target_user.get('payment_id')}")
            print(f"  Payment Value: R$ {target_user.get('payment_value')}")
            print(f"  Payment Confirmed At: {target_user.get('payment_confirmed_at')}")
        
        return True
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Webhook investigation failed: {str(e)}")
        return False

if __name__ == "__main__":
    investigate_webhook_users()