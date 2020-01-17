from django.urls import path,re_path

from . import views

urlpatterns = [
    path('index/', views.home,name='home'),
    path('tool_display/', views.tool_display),
    re_path('^qxyl/(?P<id>[0-9]+)/', views.qxyl,name='qxyl'),
    path('cuttingforce_cal/',views.cuttingforce_cal,name='cuttingforce_cal'),
    path('model_debugger/',views.model_debugger,name='model_debugger'),
    path('save_models/',views.save_models,name='save_models'),
    path('get_models_by_view_name/',views.get_models_by_view_name,name='get_models_by_view_name'),
    path('delete_model/',views.delete_model,name='delete_model'),
    path('get_views/',views.get_views,name='get_views'),
    
    


]