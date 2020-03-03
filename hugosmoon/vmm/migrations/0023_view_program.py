# Generated by Django 3.0.3 on 2020-03-01 23:18

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('vmm', '0022_load_models_conf_model_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='view_program',
            fields=[
                ('id', models.AutoField(db_column='id', primary_key=True, serialize=False)),
                ('view_id', models.IntegerField(db_column='view_id', default=0)),
                ('code', models.TextField(blank=True, db_column='code')),
                ('createtime', models.DateTimeField(db_column='createtime', default=django.utils.timezone.now)),
                ('isdelete', models.BooleanField(db_column='is_delete', default=False)),
            ],
        ),
    ]