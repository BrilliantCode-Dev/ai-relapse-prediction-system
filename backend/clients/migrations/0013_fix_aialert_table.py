from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0012_aialert'),
    ]

    operations = [
        migrations.CreateModel(
            name='AIAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('risk_level', models.CharField(max_length=20)),
                ('risk_score', models.FloatField()),
                ('alert_type', models.CharField(max_length=50)),
                ('trigger_source', models.CharField(max_length=50)),
                ('prediction', models.TextField()),
                ('message', models.TextField()),
                ('reasons', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),

                ('caregiver', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='ai_alerts',
                    to='staff.staffprofile'
                )),

                ('client', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='ai_alerts',
                    to='clients.client'
                )),

                ('chat_message', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    to='clients.chatmessage'
                )),

                ('journal_entry', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    to='clients.journalentry'
                )),
            ],
        ),
    ]