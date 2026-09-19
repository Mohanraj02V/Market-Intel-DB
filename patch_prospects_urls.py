import re

filepath = 'backend/prospects/urls.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "router.register(r'prospects', ProspectViewSet, basename='prospect')",
    "router.register(r'prospects', ProspectViewSet, basename='prospect')\nrouter.register(r'lq-pipeline', LQPipelineViewSet, basename='lq-pipeline')"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
