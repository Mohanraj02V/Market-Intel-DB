import re

filepath = 'backend/prospects/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    @action(detail=True, methods=['post'], url_path='confirm-reverification')
    def confirm_reverification(self, request, pk=None):"""

replacement = """    @action(detail=True, methods=['post'], url_path='complete-pre-task')
    def complete_pre_task(self, request, pk=None):
        lq = self.get_object()
        lq.pre_task_status = LeadQualification.PreTaskStatus.PRE_UPDATED
        lq.save()
        return Response(self.get_serializer(lq).data)

    @action(detail=True, methods=['post'], url_path='confirm-reverification')
    def confirm_reverification(self, request, pk=None):"""

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
