import requests

login_data = {
    'email': 'pre_user@example.com',
    'password': 'testpass123'
}

session = requests.Session()
response = session.post('http://localhost:8000/api/auth/login/', json=login_data)
if response.status_code == 200:
    token = response.json().get('access')
    headers = {'Authorization': f'Bearer {token}'}
    res = session.get('http://localhost:8000/api/prospects/e39b9b4d-b243-4449-a0b6-f99b6e2d5997/', headers=headers)
    print("STATUS:", res.status_code)
    print("RESPONSE:", res.text[:500])
else:
    print("LOGIN FAILED:", response.status_code)
