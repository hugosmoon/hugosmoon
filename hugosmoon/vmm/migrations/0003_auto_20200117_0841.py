# Generated by Django 3.0.2 on 2020-01-17 08:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vmm', '0002_auto_20200113_0723'),
    ]

    operations = [
        migrations.AddField(
            model_name='load_models_conf',
            name='scale_x',
            field=models.FloatField(db_column='scale_x', default=1),
        ),
        migrations.AddField(
            model_name='load_models_conf',
            name='scale_y',
            field=models.FloatField(db_column='scale_y', default=1),
        ),
        migrations.AddField(
            model_name='load_models_conf',
            name='scale_z',
            field=models.FloatField(db_column='scale_z', default=1),
        ),
    ]
