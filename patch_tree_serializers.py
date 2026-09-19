import re

filepath = 'backend/prospects/serializers.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add ProspectSimpleSerializer just above ProspectSerializer
simple_serializer = """class ProspectSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prospect
        fields = ['id', 'company_name', 'country_head_office', 'primary_industries', 'company_structure', 'operational_status']

class ProspectSerializer"""

content = content.replace("class ProspectSerializer", simple_serializer)

# 2. Add parent_companies_detail and child_companies_detail to ProspectSerializer
new_fields = """    parent_companies_detail = ProspectSimpleSerializer(source='parent_companies', many=True, read_only=True)
    child_companies_detail = ProspectSimpleSerializer(source='child_companies', many=True, read_only=True)
    
    class Meta:"""

content = content.replace("    class Meta:", new_fields)

# 3. Add to fields array
content = content.replace(
    "'parent_companies', 'status_target',",
    "'parent_companies', 'parent_companies_detail', 'child_companies_detail', 'status_target',"
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched serializers.py")
