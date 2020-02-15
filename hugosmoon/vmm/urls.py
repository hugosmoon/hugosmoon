from django.urls import path,re_path
from django.conf.urls import url


from . import views

urlpatterns = [
    path('index/', views.home,name='home'),
    path('tool_display/', views.tool_display,name='tool_display'),
    path('qxyl/', views.qxyl,name='qxyl'),
    path('cuttingforce_cal/',views.cuttingforce_cal,name='cuttingforce_cal'),
    url(r'model_debugger/',views.model_debugger,name='model_debugger'),
    path('save_models/',views.save_models,name='save_models'),
    path('get_models_by_view/',views.get_models_by_view,name='get_models_by_view'),
    path('delete_model/',views.delete_model,name='delete_model'),
    path('get_views/',views.get_views,name='get_views'),
    path('add_view/',views.add_view,name='add_view'),
    path('model_manage/',views.model_manage,name='model_manage'),
    path('create_folder/',views.create_folder,name='create_folder'),
    path('get_folders/',views.get_folders,name='get_folders'),
    path('upload_model/',views.upload_model,name='upload_model'),
    path('get_model_by_folderid/',views.get_model_by_folderid,name='get_model_by_folderid'),
    path('get_model_info_by_id/',views.get_model_info_by_id,name='get_model_info_by_id'),
    path('is_view_exist/',views.is_view_exist,name='is_view_exist'),
    re_path('^view_display/(?P<view_id>[0-9]+)/',views.view_display,name='view_display'),
    path('create_display_view/',views.create_display_view,name='create_display_view'),
    path('get_display_view/',views.get_display_view,name='get_display_view'),
    path('test/',views.test,name='test'),

    
]

