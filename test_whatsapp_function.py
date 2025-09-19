#!/usr/bin/env python3
"""
Test script to verify the updated send_password_whatsapp function
"""
import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, '/app/backend')

# Import the function
from server import send_password_whatsapp

async def test_whatsapp_function():
    """Test the updated WhatsApp function"""
    print("🧪 Testing updated send_password_whatsapp function...")
    print("=" * 60)
    
    # Test data
    phone = "(27) 99999-9999"
    name = "João Silva"
    password = "Test123@"
    
    print(f"📱 Testing with:")
    print(f"   Phone: {phone}")
    print(f"   Name: {name}")
    print(f"   Password: {password}")
    print(f"   Force Send: True (default)")
    print()
    
    # Test with default force_send=True
    print("🔄 Testing with force_send=True (default)...")
    result1 = await send_password_whatsapp(phone, name, password)
    print(f"✅ Result: {result1}")
    print()
    
    # Test with force_send=False
    print("🔄 Testing with force_send=False...")
    result2 = await send_password_whatsapp(phone, name, password, force_send=False)
    print(f"✅ Result: {result2}")
    print()
    
    print("=" * 60)
    print("🎉 Test completed successfully!")
    print(f"📊 Results: force_send=True -> {result1}, force_send=False -> {result2}")

if __name__ == "__main__":
    asyncio.run(test_whatsapp_function())