from django.urls import path

from . import views

urlpatterns = [
    path('index/', views.home),
    path('tool_display/', views.tool_display),
    

]