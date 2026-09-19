import re

filepath = 'backend/prospects/urls.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if "lq-pipeline" not in content:
    content = content.replace("from .views import ProspectViewSet", "from .views import ProspectViewSet, LQPipelineViewSet")
    content = content.replace("router.register(r'prospects', ProspectViewSet)", "router.register(r'prospects', ProspectViewSet)\nrouter.register(r'lq-pipeline', LQPipelineViewSet, basename='lq-pipeline')")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added lq-pipeline route to urls.py")
