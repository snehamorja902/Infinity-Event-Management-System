import requests

login_url = "http://localhost:8000/api/login/"
credentials = {"username": "admin", "password": "admin123"}

response = requests.post(login_url, json=credentials)
if response.status_code == 200:
    tokens = response.json()
    access_token = tokens['access']
    print("Login successful")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    endpoints = [
        "bookings/",
        "concert-bookings/",
        "festival-bookings/",
        "tournaments/",
        "sports-registrations/",
        "careers/applications/",
        "blogs/",
        "fixtures/"
    ]
    
    for endpoint in endpoints:
        res = requests.get(f"http://localhost:8000/api/{endpoint}", headers=headers)
        print(f"{endpoint:<25}: {res.status_code} - Found {len(res.json()) if isinstance(res.json(), list) else 'N/A'} items")
else:
    print(f"Login failed: {status_code}")
    print(response.json())
