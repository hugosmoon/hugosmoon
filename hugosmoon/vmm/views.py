from django.shortcuts import render,HttpResponse

 
def home(request):
    return render(request, 'index.html')

def tool_display(request):
    return render(request, 'tooldisplay/tooldisplay.html')

def qxyl(request,id): 
    if id=='1':
        return render(request, 'cuttingforce/qxyl_1.html')
    elif id =='2':
        return render(request, 'cuttingforce/qxyl_2.html')

# 计算切削力
def cuttingforce_cal(request):
    return HttpResponse(79)
