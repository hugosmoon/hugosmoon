from django.shortcuts import render,HttpResponse
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import math
import random
import json
from vmm.models import Load_models_conf


 
def home(request):
    return render(request, 'index.html')

def tool_display(request):
    return render(request, 'tooldisplay/tooldisplay.html')

def qxyl(request,id): 
    if id=='1':
        return render(request, 'cuttingforce/qxyl_1.html')
    elif id =='2':
        return render(request, 'cuttingforce/qxyl_2.html')
def model_debugger(request):
    return render(request, 'test/model_debugger.html')

# 计算切削力
@csrf_exempt
def cuttingforce_cal(request):
    #接收基础参数
    if request.method == 'POST':
        workpiece_material=request.POST.get('bangliao_material')
        feed_rate = float(request.POST.get('feed_rate'))
        cutting_depth = float(request.POST.get('cutting_depth'))
        cutting_speed = float(request.POST.get('cutting_speed'))
        tool_cutting_edge_angle = float(request.POST.get('tool_cutting_edge_angle'))
        rake_angle = float(request.POST.get('rake_angle'))
    else:
        return HttpResponse(False)
    #定义各种参数
    c_fc=x_fc=y_fc=k_tool_cutting_edge_angle=k_rake_angle=k_tool_cutting_edge_inclination_angle=k_corner_radius=k_strength=0
    k_cutting_speed=1

    #依据工件材料修改参数
    if(workpiece_material=="45_steel"):
        c_fc = 180
        x_fc = 1.0
        y_fc = 0.75
        k_strength=1
        if(float(cutting_speed)<17):
            k_cutting_speed=1-(0.2/17)*float(cutting_speed)
        elif(float(cutting_speed)>=17 and float(cutting_speed)<30):
            k_cutting_speed = 0.8 + (0.4/ 13) * (float(cutting_speed)-17)
        elif(float(cutting_speed)>=30 and float(cutting_speed)<40):
            k_cutting_speed=1.2-(float(cutting_speed)-30)*(0.2/10)
        elif(float(cutting_speed)>=40 and float(cutting_speed)<800):
            k_cutting_speed = 1 - (float(cutting_speed) - 40) * (0.2/760)
        elif(float(cutting_speed)>=1000):
            k_cutting_speed=0.8

    elif(workpiece_material=="stainless_steel"):
        c_fc = 204
        x_fc = 1.0
        y_fc = 0.75
        k_strength = 1
    elif (workpiece_material == "gray_iron"):
        c_fc = 92
        x_fc = 1.0
        y_fc = 0.75
        k_strength = 1
    elif (workpiece_material == "malleable_cast_iron"):
        c_fc = 81
        x_fc = 1.0
        y_fc = 0.75
        k_strength = 1

    #依据刀具角度修改参数
    #主偏角
    k_tool_cutting_edge_angle=(0.004949*tool_cutting_edge_angle*tool_cutting_edge_angle-0.9112*tool_cutting_edge_angle+130.9)/100

    #前角
    k_rake_angle=1.25-((rake_angle+15)/100)

    #刃倾角系数
    k_tool_cutting_edge_inclination_angle = 1

    #刀尖圆弧半径系数
    k_corner_radius=1

    #计算切削力
    cutting_force=9.81*c_fc*(math.pow(cutting_depth,x_fc))*(math.pow(feed_rate,y_fc))*k_tool_cutting_edge_angle*k_rake_angle*k_tool_cutting_edge_inclination_angle*k_corner_radius*k_strength*k_cutting_speed

    return HttpResponse(cutting_force)

#将模型的配置信息存入数据库  
@csrf_exempt
def save_models(request):
    #接收基础参数
    if request.method == 'POST':
        models=request.POST.getlist('models')
        models= json.loads(models[0])
        for model in models:
            print(model)
            
            view_name=model['view_name']
            model_index=model['index']
            model_name=model['name']
            model_url=model['url']
            position_x=model['position_x']
            position_y=model['position_y']
            position_z=model['position_z']
            rotation_x=model['rotation_x']
            rotation_y=model['rotation_y']
            rotation_z=model['rotation_z']
            materials_color_r=model['materials_color_r']
            materials_color_g=model['materials_color_g']
            materials_color_b=model['materials_color_b']

            models_in=Load_models_conf.objects.filter(view_name=view_name,model_index=model_index)
            if len(models_in) > 0:
                models_in.update(view_name=view_name,model_index=model_index,model_name=model_name,model_url=model_url,position_x=position_x,position_y=position_y,position_z=position_z,rotation_x=rotation_x,rotation_y=rotation_y,rotation_z=rotation_z,materials_color_r=materials_color_r,materials_color_g=materials_color_g,materials_color_b=materials_color_b)
            else:
                Load_models_conf.objects.create(view_name=view_name,model_index=model_index,model_name=model_name,model_url=model_url,position_x=position_x,position_y=position_y,position_z=position_z,rotation_x=rotation_x,rotation_y=rotation_y,rotation_z=rotation_z,materials_color_r=materials_color_r,materials_color_g=materials_color_g,materials_color_b=materials_color_b)
        return HttpResponse('ok')
#根据场景名称获取模型组数据
@csrf_exempt
def get_models_by_view_name(request):
    if request.method == 'POST':
        view_name=request.POST.get('view_name')
        print(view_name)
        models=Load_models_conf.objects.filter(view_name=view_name,isdelete=False).values()
        data={}
        data['models'] = list(models)
        return JsonResponse(data)

#根据模型场景名称和index删除模型
@csrf_exempt
def delete_model(request):
    # return HttpResponse('success')
    if request.method == 'POST':
        view_name=request.POST.get('view_name')
        model_index=request.POST.get('model_index')
        print(view_name)
        print(model_index)
        model=Load_models_conf.objects.filter(view_name=view_name,model_index=model_index)
        model.update(isdelete=True)
        return HttpResponse('delete_success')



    