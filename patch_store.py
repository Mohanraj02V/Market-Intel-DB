import re

filepath = 'frontend/src/app/store.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "import userReducer from '../features/users/userSlice';" not in content:
    content = content.replace(
        "import lqPipelineReducer from '../features/lqPipeline/lqPipelineSlice';",
        "import lqPipelineReducer from '../features/lqPipeline/lqPipelineSlice';\nimport userReducer from '../features/users/userSlice';"
    )
    content = content.replace(
        "lqPipeline: lqPipelineReducer,",
        "lqPipeline: lqPipelineReducer,\n    users: userReducer,"
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
