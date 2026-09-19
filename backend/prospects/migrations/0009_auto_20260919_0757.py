from django.db import migrations

def migrate_outreach_logs(apps, schema_editor):
    OutreachLog = apps.get_model('prospects', 'OutreachLog')
    CommunicationActivity = apps.get_model('prospects', 'CommunicationActivity')
    CallActivity = apps.get_model('prospects', 'CallActivity')

    for log in OutreachLog.objects.all():
        if log.activity_type == 'Email':
            CommunicationActivity.objects.create(
                prospect=log.prospect,
                activity_type='EMAIL_SENT',
                status=log.status,
                outcome=log.outcome,
                notes=log.notes,
                performed_by=log.created_by,
                # Can't set created_at here if it's auto_now_add, but we can do an update after creation.
                # Actually, django models in migrations don't enforce auto_now_add, so we can set it.
            )
        elif log.activity_type == 'Call':
            # Create CallActivity first, then CommunicationActivity
            # We don't have a contact to map to, we'll try to pick the first one if it exists or leave blank (if allowed).
            # Wait, CallActivity requires prospect_contact! Let's check CallActivity model from my script:
            # prospect_contact = models.ForeignKey(ProspectContact, on_delete=models.CASCADE, related_name='call_activities')
            # It's NOT null=True. But old OutreachLog didn't have prospect_contact!
            # Let's get the first prospect contact or create a dummy one for migration if none exists.
            ProspectContact = apps.get_model('prospects', 'ProspectContact')
            contact = ProspectContact.objects.filter(prospect=log.prospect).first()
            
            if not contact:
                contact = ProspectContact.objects.create(
                    prospect=log.prospect,
                    contact_name="Legacy Contact (Migrated)"
                )
            
            call = CallActivity.objects.create(
                prospect=log.prospect,
                prospect_contact=contact,
                created_by=log.created_by,
                call_status=log.status or 'Unknown',
                communication_outcome=log.outcome,
                notes=log.notes,
            )
            
            CommunicationActivity.objects.create(
                prospect=log.prospect,
                prospect_contact=contact,
                activity_type='CALL',
                status=log.status,
                outcome=log.outcome,
                notes=log.notes,
                call_activity=call,
                performed_by=log.created_by,
            )

            # We need to update created_at to match the original log's timestamp.
            # CallActivity
            CallActivity.objects.filter(pk=call.pk).update(created_at=log.created_at)

        # Update timestamps for Comm Activity too
        # Find the one we just created and update it
        latest_comm = CommunicationActivity.objects.filter(prospect=log.prospect).last()
        if latest_comm:
            CommunicationActivity.objects.filter(pk=latest_comm.pk).update(created_at=log.created_at)


def reverse_migrate_outreach_logs(apps, schema_editor):
    pass # Reversible by just dropping the new models later


class Migration(migrations.Migration):

    dependencies = [
        ('prospects', '0008_callactivity_outreachemail_emailattachment_and_more'),
    ]

    operations = [
        migrations.RunPython(migrate_outreach_logs, reverse_migrate_outreach_logs),
    ]
