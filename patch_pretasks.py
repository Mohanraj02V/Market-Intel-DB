import re

filepath = 'frontend/src/pages/PreTasksPage.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = "import { fetchLqPipeline, confirmReverification } from '../features/lqPipeline/lqPipelineSlice';"
replacement = "import { fetchLqPipeline, completePreTask } from '../features/lqPipeline/lqPipelineSlice';"
content = content.replace(target, replacement)

target2 = "    dispatch(confirmReverification(lqId)).then(() => {"
replacement2 = "    dispatch(completePreTask(lqId)).then(() => {"
content = content.replace(target2, replacement2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
