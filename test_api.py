import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:8000/api/market-events/") as url:
        data = json.loads(url.read().decode())
        print(json.dumps(data, indent=2))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
