import os

file_path = 'src/app/store.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "marketEventReducer" not in content:
    content = content.replace("import authReducer from '../features/auth/authSlice';", "import authReducer from '../features/auth/authSlice';\nimport marketEventReducer from '../features/marketEvents/marketEventSlice';")
    content = content.replace("prospects: prospectReducer,", "prospects: prospectReducer,\n    marketEvents: marketEventReducer,")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated store.js")
