from django.db import models
import django.utils.timezone as timezone

# Create your models here.

#模型设置
class Load_models_conf(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    view_id = models.IntegerField(default=0,db_column="view_id")
    model_id = models.IntegerField(default=0,db_column="model_id")
    # view_name = models.CharField(max_length=255, db_column="view_name")
    serial = models.IntegerField(default=0,db_column="serial")
    model_name= models.CharField(default='',max_length=255, db_column="model_name")
    model_url=models.CharField(default='',max_length=255, db_column="model_url")
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

    metalness=models.FloatField(default=1,db_column="metalness")
    roughness=models.FloatField(default=0.5,db_column="roughness")
    emissive_r=models.FloatField(default=1,db_column="emissive_r")
    emissive_g=models.FloatField(default=1,db_column="emissive_g")
    emissive_b=models.FloatField(default=1,db_column="emissive_b")
    emissiveIntensity=models.FloatField(default=0,db_column="emissiveIntensity")
    reflectivity=models.FloatField(default=0.5,db_column="reflectivity")


    isdelete = models.BooleanField(default=False, db_column="f_is_delete")
    createtime = models.DateTimeField(default=timezone.now, db_column="f_createtime")
    updatetime = models.DateTimeField(default=timezone.now, db_column="f_updatetime")

#文件夹
class folder(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    folder_name = models.CharField(max_length=255, db_column="folder_name")
    isdelete = models.BooleanField(default=False, db_column="is_delete")
    createtime = models.DateTimeField(default=timezone.now, db_column="f_createtime")
    updatetime = models.DateTimeField(default=timezone.now, db_column="f_updatetime")

#模型
class com_model(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    model_name = models.CharField(max_length=255, db_column="model_name")
    folder_id=models.IntegerField(default=0,db_column="folder_id")
    url=models.CharField(max_length=255, db_column="url")
    createtime = models.DateTimeField(default=timezone.now, db_column="f_createtime")
    isdelete = models.BooleanField(default=False, db_column="is_delete")

#场景
class views(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    view_name = models.CharField(max_length=255, db_column="view_name")
    createtime = models.DateTimeField(default=timezone.now, db_column="f_createtime")
    parent_id=models.IntegerField(default=0,db_column="parent_id")
    isdelete = models.BooleanField(default=False, db_column="is_delete")
#预览场景
class display_views(models.Model):
    id = models.AutoField(primary_key=True, db_column="id")
    view_id=models.IntegerField(default=0,db_column="view_id")
    display_name = models.CharField(max_length=255, db_column="display_name")
    createtime = models.DateTimeField(default=timezone.now, db_column="createtime")
    isdelete = models.BooleanField(default=False, db_column="is_delete")


