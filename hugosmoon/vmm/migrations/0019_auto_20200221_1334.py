# Generated by Django 3.0.3 on 2020-02-21 05:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vmm', '0018_auto_20200221_1313'),
    ]

    operations = [
        migrations.AlterField(
            model_name='views',
            name='owner_id',
            field=models.IntegerField(db_column='owner_id', default=1),
        ),
    ]