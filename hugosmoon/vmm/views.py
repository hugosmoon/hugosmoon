from django.shortcuts import render

 
def home(request):
    return render(request, 'index.html')

def tool_display(request):
    return render(request, 'tooldisplay.html')

# Create your views here.
