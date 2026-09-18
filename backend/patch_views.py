import os

file_path = 'prospects/views.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

get_queryset_method = """    def get_queryset(self):
        queryset = Prospect.objects.all().order_by('-updated_at')
        market_event = self.request.query_params.get('market_event')
        if market_event:
            queryset = queryset.filter(market_event_participations__market_event=market_event).distinct()
        return queryset

    def create"""

if "def get_queryset(self):" not in content:
    content = content.replace("    def create", get_queryset_method)
    
    # Remove queryset = Prospect.objects.all().order_by('-updated_at') from class level
    content = content.replace("    queryset = Prospect.objects.all().order_by('-updated_at')\n", "")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated views.py")
