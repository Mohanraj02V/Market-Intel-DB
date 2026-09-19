import re

filepath = 'backend/prospects/serializers.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add LeadQualification serializer to the end
lq_serializer = """
from .models import LeadQualification

class LeadQualificationSerializer(serializers.ModelSerializer):
    prospect = ProspectSimpleSerializer(read_only=True)
    
    class Meta:
        model = LeadQualification
        fields = [
            'id', 'prospect', 'verification_status', 'pre_task_status',
            'qualification_status', 'qualification_score', 'lq_notes',
            'budget', 'authority', 'need', 'timeline',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'prospect', 'pre_task_status', 'created_at', 'updated_at']
"""

if "class LeadQualificationSerializer" not in content:
    content += lq_serializer
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added LeadQualificationSerializer to serializers.py")
else:
    print("LeadQualificationSerializer already exists")
