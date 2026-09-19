import re

filepath = 'backend/prospects/serializers.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The incorrect injection is exactly:
bad_injection = """    parent_companies_detail = ProspectSimpleSerializer(source='parent_companies', many=True, read_only=True)
    child_companies_detail = ProspectSimpleSerializer(source='child_companies', many=True, read_only=True)
    
"""

content = content.replace(bad_injection, "")

# Now I must carefully add it ONLY to ProspectSerializer
# I will find "class ProspectSerializer(serializers.ModelSerializer):" and insert it after the first few fields
target = """class ProspectSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()"""

replacement = """class ProspectSerializer(serializers.ModelSerializer):
    parent_companies_detail = ProspectSimpleSerializer(source='parent_companies', many=True, read_only=True)
    child_companies_detail = ProspectSimpleSerializer(source='child_companies', many=True, read_only=True)
    products = serializers.SerializerMethodField()"""

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed serializers.py")
