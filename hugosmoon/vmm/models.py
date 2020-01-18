from django.db import models
import django.utils.timezone as timezone

# Create your models here.

class Load_models_conf(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    view_name = models.CharField(max_length=255, db_column="view_name")
    model_index= models.CharField(max_length=255, db_column="model_index")
    model_name= models.CharField(max_length=255, db_column="model_name")
    model_url=models.CharField(max_length=255, db_column="model_url")
    position_x=models.FloatField(db_column="position_x")
    position_y=models.FloatField(db_column="position_y")
    position_z=models.FloatField(db_column="position_z")
    rotation_x=models.FloatField(db_column="rotation_x")
    rotation_y=models.FloatField(db_column="rotation_y")
    rotation_z=models.FloatField(db_column="rotation_z")
    materials_color_r=models.FloatField(default=0.13,db_column="materials_color_r")
    materials_color_g=models.FloatField(default=0.13,db_column="materials_color_g")
    materials_color_b=models.FloatField(default=0.13,db_column="materials_color_b")
    scale_x=models.FloatField(default=1,db_column="scale_x")
    scale_y=models.FloatField(default=1,db_column="scale_y")
    scale_z=models.FloatField(default=1,db_column="scale_z")

    materials_type=models.IntegerField(default=1,db_column="materials_type")

    isdelete = models.BooleanField(default=False, db_column="f_is_delete")
    createtime = models.DateTimeField(default=timezone.now, db_column="f_createtime")
    updatetime = models.DateTimeField(default=timezone.now, db_column="f_updatetime")
class folder(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    folder_name = models.CharField(max_length=255, db_column="folder_name")
    isdelete = models.BooleanField(default=False, db_column="is_delete")
    createtime = models.DateTimeField(default=timezone.now, db_column="f_createtime")
    updatetime = models.DateTimeField(default=timezone.now, db_column="f_updatetime")