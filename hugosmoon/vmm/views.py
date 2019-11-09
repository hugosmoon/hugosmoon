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



# 计算切削力

def cutting_force_cal(request):
    #接收基础参数
    if request.method == 'POST':
        workpiece_material=request.POST.get('workpiece_material')
        feed_rate = float(request.POST.get('feed_rate'))
        cutting_depth = float(request.POST.get('cutting_depth'))
        cutting_speed = float(request.POST.get('cutting_speed'))
        tool_cutting_edge_angle = (request.POST.get('tool_cutting_edge_angle'))
        rake_angle = (request.POST.get('rake_angle'))
        tool_cutting_edge_inclination_angle = (request.POST.get('tool_cutting_edge_inclination_angle'))
        corner_radius = (request.POST.get('corner_radius'))
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
    if(tool_cutting_edge_angle=="30"):
        k_tool_cutting_edge_angle=1.08
    elif(tool_cutting_edge_angle=="45"):
        k_tool_cutting_edge_angle=1.0
    elif(tool_cutting_edge_angle=="60"):
        k_tool_cutting_edge_angle=0.94
    elif(tool_cutting_edge_angle=="75"):
        k_tool_cutting_edge_angle=0.92
    elif (tool_cutting_edge_angle == "90"):
        k_tool_cutting_edge_angle = 0.89

    #前角
    if(rake_angle=="-15"):
        k_rake_angle=1.25
    elif(rake_angle=="-10"):
        k_rake_angle=1.2
    elif(rake_angle=="0"):
        k_rake_angle=1.1
    elif(rake_angle=="10"):
        k_rake_angle=1.0
    elif(rake_angle=="20"):
        k_rake_angle=0.9

    #刃倾角
    # if(tool_cutting_edge_inclination_angle=="5"):
    #     k_tool_cutting_edge_inclination_angle=0.75
    # elif(tool_cutting_edge_inclination_angle=="0"):
    #     k_tool_cutting_edge_inclination_angle=1.0
    # elif (tool_cutting_edge_inclination_angle == "-5"):
    #     k_tool_cutting_edge_inclination_angle = 1.25
    # elif (tool_cutting_edge_inclination_angle == "-10"):
    #     k_tool_cutting_edge_inclination_angle = 1.5
    # elif (tool_cutting_edge_inclination_angle == "-15"):
    k_tool_cutting_edge_inclination_angle = 1

    #刀尖圆弧半径
    k_corner_radius=1

    #计算切削力
    cutting_force=(random.uniform(0.98, 1.02))*9.81*c_fc*(math.pow(cutting_depth,x_fc))*(math.pow(feed_rate,y_fc))*k_tool_cutting_edge_angle*k_rake_angle*k_tool_cutting_edge_inclination_angle*k_corner_radius*k_strength*k_cutting_speed

    return HttpResponse(cutting_force)
