import os
import re

# Update settings.py
settings_path = 'config/settings.py'
with open(settings_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "'market_events'" not in content:
    content = content.replace(
        "'prospects',",
        "'prospects',\n    'market_events',"
    )
    with open(settings_path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update urls.py
urls_path = 'config/urls.py'
with open(urls_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "market_events.urls" not in content:
    content = content.replace(
        "path('api/', include('prospects.urls')),",
        "path('api/', include('prospects.urls')),\n    path('api/', include('market_events.urls')),"
    )
    with open(urls_path, 'w', encoding='utf-8') as f:
        f.write(content)
