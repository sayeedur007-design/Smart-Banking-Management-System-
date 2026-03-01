import requests
import json

url = "http://localhost:8000/api/v1/auth/register"
data = {
    "email": "testpython@example.com",
    "password": "password123",
    "name": "Test Python",
    "mobile": "9876543210"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
