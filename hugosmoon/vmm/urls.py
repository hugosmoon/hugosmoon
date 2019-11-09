from django.urls import path,re_path

from . import views

urlpatterns = [
    path('index/', views.home,name='home'),
    path('tool_display/', views.tool_display),
    re_path('^qxyl/(?P<id>[0-9]+)/', views.qxyl,name='qxyl'),
    path('cuttingforce_cal/',views.cuttingforce_cal,name='cuttingforce_cal'),

]