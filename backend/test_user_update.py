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
    
    # get users
    res = session.get('http://localhost:8000/api/auth/users/', headers=headers)
    users = res.json().get('results', [])
    
    # try updating the first user's role
    user_id = users[0]['id']
    old_role = users[0]['role']
    new_role = 'LQ' if old_role == 'PRE' else 'PRE'
    
    update_res = session.patch(f'http://localhost:8000/api/auth/users/{user_id}/', json={'role': new_role}, headers=headers)
    print("Update Response:", update_res.status_code, update_res.json())
else:
    print("LOGIN FAILED:", response.status_code)
