import requests

login_data = {
    'username': 'pre_demo',
    'password': 'demo123'
}

session = requests.Session()
response = session.post('http://localhost:8000/api/auth/login/', json=login_data)
if response.status_code == 200:
    token = response.json().get('access')
    headers = {'Authorization': f'Bearer {token}'}
    res = session.get('http://localhost:8000/api/lq-pipeline/', headers=headers)
    print("STATUS:", res.status_code)
    print("DATA LENGTH:", len(res.json().get('results', [])))
else:
    print("LOGIN FAILED:", response.status_code)
