let renderer, camera, scene;


let main_angle=60,tool_minor_cutting_edge_angle=15,edge_inclination_angle=0,rake_angle=30,back_angle=10,secondary_edge_back_angl=10;
let bcdl=0.2,jjl=1;
let duidaobuchang=10;//对刀完成后后退的距离
let machine_speed=0;
let szjp_distance=15;//三爪夹盘爪子距离中心的高度


let szjp_pan,szjp_zhua1,szjp_zhua2,szjp_zhua3;

let count=0;//计数器

let bangliao=[];
let bangliao_r1=80,bangliao_r2=bangliao_r1-bcdl,bangliao2_r2=40;//未加工和已经加工的棒料半径
let bangliao_length=600,cut_length=0,bangliao2_length=0.0001;
let bangliao1_Geometry,bangliao2_Geometry,bangliao3_Geometry,bangliao4_Geometry;

let daojujiaodubuchang=0;

let rot_angle=0;

let bangliao_material;
let plane;

let weizuo;
let weizuodingjian;
let daojia1,daojia2;
let jichuang;
let tool;
let sigang;
let load_status=false;

let model_number=0;//记录加载模型的数量

let last_frame_time=Date.now();//上一帧时间戳
let frame_time=20;//当前时间戳

let cut_corner_end=false;//切削棒料角是否结束，与棒料2的长度及两端半径确定有关

let cutting_force=0;//切削力

bangliao_r1=parseFloat(GetQueryString('bangliao_r'));
bangliao_length=parseFloat(GetQueryString('bangliao_length'));
main_angle=parseFloat(GetQueryString('main_angle'));
tool_minor_cutting_edge_angle=parseFloat(GetQueryString('tool_minor_cutting_edge_angle'));
edge_inclination_angle=parseFloat(GetQueryString('edge_inclination_angle'));
rake_angle=parseFloat(GetQueryString('rake_angle'));
back_angle=parseFloat(GetQueryString('back_angle'));
secondary_edge_back_angl=parseFloat(GetQueryString('secondary_edge_back_angl'));
daojujiaodubuchang = parseFloat(GetQueryString('daojujiaodubuchang'));
bangliao_material = GetQueryString('bangliao_material');
//let stats = initStats();
let chart_line1,chart_line2;




//初始化渲染器
function initThree() {
    
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });//定义渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);//设置渲染的宽度和高度
    document.getElementById('render').appendChild(renderer.domElement);//将渲染器加在html中的div里面

    renderer.setClearColor(0x444444, 1.0);//渲染的颜色设置
    renderer.shadowMapEnabled = true;//开启阴影，默认是关闭的，太影响性能
    renderer.shadowMapType = THREE.PCFSoftShadowMap;//阴影的一个类型


    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);//perspective是透视摄像机，这种摄像机看上去画面有3D效果

    //摄像机的位置
    camera.position.x = -1500;
    camera.position.y = -1500;
    camera.position.z = 500;
    camera.up.x = 0;
    camera.up.y = 0;
    camera.up.z = 1;//摄像机的上方向是Z轴
    camera.lookAt(0, -50, 0);//摄像机对焦的位置
    //这三个参数共同作用才能决定画面

    scene = new THREE.Scene();

    let light = new THREE.SpotLight(0xffffff, 1.2, 0);//点光源
    light.position.set(4000, 2000, 8000);
    light.castShadow = true;//开启阴影
    light.shadowMapWidth = 8192;//阴影的分辨率，可以不设置对比看效果
    light.shadowMapHeight = 8192;
    scene.add(light);

    let light2 = new THREE.SpotLight(0xffffff, 0.6, 0);//点光源
    light2.position.set(-3000, -3000, 2500);
    scene.add(light2);

    let light3 = new THREE.AmbientLight(0xaaaaaa, 0.6);//环境光，如果不加，点光源照不到的地方就完全是黑色的
    scene.add(light3);

    let controller = new THREE.OrbitControls(camera, renderer.domElement);
    controller.target = new THREE.Vector3(0, 0, 0);

}



//初始化场景中的所有物体
function initObject() {

    //地面
    let planeGeometry = new THREE.PlaneGeometry(5000, 5000, 20, 20);
    let planeMaterial =
        new THREE.MeshLambertMaterial({color: 0x232323})
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.z = -950;
    plane.receiveShadow = true;//开启地面的接收阴影
    scene.add(plane);//添加到场景中

    //夹盘盘的材质
    let materials_szjp_pan = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x212121,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ];

    //夹盘爪的材质
    let materials_szjp_zhua = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x323232,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ];

    //未切削棒料的材质
    materials_bangliao=[];
    materials_bangliao.push([
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x545454,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ]);
    

    //已切削棒料的材质
    materials_bangliao.push([
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x545454,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ]);
    //丝杠的材质
    materials_sigang = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x323232,
            transparent: false,
            specular: 0x323232,
            metal: true
        }),
    ];

    //尾座的材质
    let materials_weizuo = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x212121,
            transparent: false,

            metal: true
        }),
    ];


    //尾座顶尖的材质
    let materials_weizuodingjian = [
        new THREE.MeshPhongMaterial({
            opacity: 1,
            color: 0x323232,
            transparent: false,
            specular: 0x323232,
            metal: true
        }),
    ];


    var loader = new THREE.STLLoader();
    loader.load("/static/model/6140.STL", function (geometry) {
        geometry.center();




        jichuang = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_weizuo);
        jichuang.rotation.x =  0.5 *Math.PI;
        jichuang.children.forEach(function (e) {
            e.castShadow = true
        });
        jichuang.receiveShadow = true;

        jichuang.rotation.y =  -0.5 *Math.PI;
        jichuang.position.x=30;
        jichuang.position.y=-250;
        jichuang.position.z=-376;



        scene.add(jichuang);

        console.log('机床加载完成');
        model_number+=1;

        tool=create_tool(main_angle,tool_minor_cutting_edge_angle,edge_inclination_angle,rake_angle,back_angle,secondary_edge_back_angl);

        tool.position.z=0;

        tool.scale.set(0.5,0.5,0.5);
        scene.add(tool);
        console.log('车刀加载完成');
        model_number+=1;

        bangliao.push(create_cylinder(create_vertices(bangliao_r1,bangliao_r1,bangliao_length).vertices,materials_bangliao[0],materials_bangliao[0],materials_bangliao[0]));

        bangliao.push(create_cylinder(create_vertices(bangliao_r1,bangliao_r2,bangliao2_length).vertices,materials_bangliao[1],materials_bangliao[0],materials_bangliao[0]));

        bangliao.push(create_cylinder(create_vertices(bangliao_r2,bangliao_r2,bangliao_length-0.3).vertices,materials_bangliao[1],materials_bangliao[0],materials_bangliao[0]));

        // bangliao.push(create_cylinder(create_vertices(bangliao_r1,bangliao_r1,0.3).vertices,materials_bangliao[0],materials_bangliao[0],materials_bangliao[0]));

        bangliao.forEach(function(e){
            e.rotation.x=0.5*Math.PI;
            scene.add(e);
        });
        
        // for(){

        // }

        
        console.log('棒料加载完成');
        model_number+=1;

    });


    loader.load("/static/model/szjp_pan.STL", function (geometry) {
        geometry.center();
        szjp_pan = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_szjp_pan);
        szjp_pan.rotation.x = 0.5 * Math.PI;
        szjp_pan.children.forEach(function (e) {
            e.castShadow = true
        });
        szjp_pan.receiveShadow = true;
        scene.add(szjp_pan);
        console.log('盘子加载完成');
        model_number+=1;
    });

    loader.load("/static/model/szjp_zhua.STL", function (geometry) {
        geometry.center();
        szjp_zhua1 = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_szjp_zhua);
        szjp_zhua1.rotation.x =  0.5 *Math.PI;
        szjp_zhua1.position.y=-89.6;
        // szjp_zhua1.scale.set(0.1, 0.1, 0.1);
        szjp_zhua1.children.forEach(function (e) {
            e.castShadow = true
        });
        szjp_zhua1.receiveShadow = true;
        szjp_zhua2=szjp_zhua1.clone();
        szjp_zhua3=szjp_zhua1.clone();

        scene.add(szjp_zhua1);
        scene.add(szjp_zhua2);
        scene.add(szjp_zhua3);

        console.log('爪子加载完成');
        model_number+=1;




    });

    loader.load("/static/model/weizuo.STL", function (geometry) {
        geometry.center();
        weizuo = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_weizuo);
        weizuo.rotation.x =  0.5 *Math.PI;
        // weizuo.scale.set(0.1, 0.1, 0.1);
        weizuo.children.forEach(function (e) {
            e.castShadow = true
        });
        weizuo.receiveShadow = true;
        weizuo.rotation.y =  -0.5 *Math.PI;
        weizuo.position.x=65;
        weizuo.position.z=-47;
        scene.add(weizuo);


        let dingjian1,dingjian2;
        let dingjian1_Geometry=new THREE.CylinderGeometry(32, 32, 100,360,100);
        dingjian1 = THREE.SceneUtils.createMultiMaterialObject(dingjian1_Geometry, materials_weizuodingjian);
        let dingjian2_Geometry=new THREE.CylinderGeometry(1, 32, 60,360,100);
        dingjian2 = THREE.SceneUtils.createMultiMaterialObject(dingjian2_Geometry, materials_weizuodingjian);
        dingjian1.position.y=-80;

        weizuodingjian=new THREE.Group();
        weizuodingjian.add(dingjian1);

        weizuodingjian.add(dingjian2);

        scene.add(weizuodingjian);


        console.log('尾座加载完成');

        model_number+=1;



    });

    loader.load("/static/model/daojia1.STL", function (geometry) {
        geometry.center();
        daojia1 = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_weizuo);
        daojia1.rotation.x =  0.5 *Math.PI;
        // daojia1.position.y=-89.6;
        // daojia1.scale.set(0.1, 0.1, 0.1);
        daojia1.children.forEach(function (e) {
            e.castShadow = true
        });
        daojia1.receiveShadow = true;

        daojia1.rotation.y =  -Math.PI;
        daojia1.position.x=-68;
        daojia1.position.z=-264;
        scene.add(daojia1);
        console.log('刀架1加载完成');
        model_number+=1;
    });

    loader.load("/static/model/daojia2.STL", function (geometry) {
        geometry.center();
        daojia2 = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_weizuo);
        daojia2.rotation.x =  0.5 *Math.PI;
        // daojia2.position.y=-8.96;
        // daojia2.scale.set(0.1, 0.1, 0.1);
        daojia2.children.forEach(function (e) {
            e.castShadow = true
        });
        daojia2.receiveShadow = true;

        daojia2.rotation.y =  -Math.PI;

        daojia2.position.z=250;
        daojia2.position.z=13;
        scene.add(daojia2);
        console.log('刀架2加载完成');
        model_number+=1;
    });

    loader.load("/static/model/sigang.STL", function (geometry) {
        geometry.center();
        sigang = THREE.SceneUtils.createMultiMaterialObject(geometry, materials_sigang);

        // sigang.scale.set(0.1, 0.1, 0.1);
        sigang.children.forEach(function (e) {
            e.castShadow = true
        });
        sigang.receiveShadow = true;

        sigang.rotation.z =  -0.5*Math.PI;

        sigang.position.y=-600;
        sigang.position.x=-200;
        sigang.position.z=-435;
        scene.add(sigang);
        console.log('丝杠加载完成');
        model_number+=1;
    });


}




//动画
function render() {

    //stats.update();

    szjp_distance=bangliao_r1+45;
    bangliao_r2=bangliao_r1-bcdl;

    frame_time= Date.now()-last_frame_time;
    last_frame_time=Date.now();

    try
    {

        weizuo.position.y=-448.5-bangliao_length-5;
        weizuodingjian.position.y=-85.5-bangliao_length;

        

        rot_angle+=frame_time*(machine_speed/30000)*Math.PI;




        szjp_pan.rotation.z=30*(Math.PI/180)-Math.PI+rot_angle;
        weizuodingjian.rotation.y=-Math.PI+rot_angle;

        szjp_zhua1.rotation.z=0.5 * Math.PI+rot_angle;
        szjp_zhua1.position.z=szjp_distance*Math.cos(-rot_angle);
        szjp_zhua1.position.x=szjp_distance*Math.sin(-rot_angle);

        szjp_zhua2.rotation.z=(0.5+2/3) * Math.PI+rot_angle;
        szjp_zhua2.position.z=szjp_distance*Math.cos(-rot_angle-(2/3)*Math.PI);
        szjp_zhua2.position.x=szjp_distance*Math.sin(-rot_angle-(2/3)*Math.PI);

        szjp_zhua3.rotation.z=(0.5+4/3) * Math.PI+rot_angle;
        szjp_zhua3.position.z=szjp_distance*Math.cos(-rot_angle-(4/3)*Math.PI);
        szjp_zhua3.position.x=szjp_distance*Math.sin(-rot_angle-(4/3)*Math.PI);

        if(cut_length<bangliao_length-100){
            if(duidaobuchang>0){
                duidaobuchang-=frame_time*machine_speed/60000;
            }
            else{
                duidaobuchang=0;
                cut_length+=jjl*frame_time*machine_speed/60000;
                if(cut_length>=bangliao_length-100){
                    cut_length=bangliao_length-100;
                    machine_speed=0;
                }

            }
            
            sigang.rotation.y+=frame_time*machine_speed*jjl*Math.PI/240000;
        }

        if(cut_length>0){
            
            if(cut_length<bcdl*trig('cot',main_angle)){
                // console.log('b:'+Date.now());
                bangliao2_r2=bangliao_r1-cut_length*trig('tan',main_angle);
                let vertices_arr=[];
                vertices_arr[0]=create_vertices(bangliao_r1,bangliao_r1,bangliao_length-cut_length).vertices;
                vertices_arr[1]=create_vertices(bangliao_r1,bangliao2_r2,cut_length).vertices;
                vertices_arr[2]=create_vertices(bangliao_r2,bangliao_r2,bangliao_length).vertices;
                // vertices_arr[3]=create_vertices(bangliao2_r2,bangliao2_r2,0.3).vertices;
                for(let i=0;i<3;i++){
                    bangliao[i].children.forEach(function (e) {
                    e.geometry.vertices = vertices_arr[i];
                    e.geometry.verticesNeedUpdate = true;//通知顶点更新
                    e.geometry.elementsNeedUpdate = true;//特别重要，通知线条连接方式更新
                    e.geometry.computeFaceNormals();
                    // console.log('123');
                    // console.log(e.matrixWorldNeedsUpdate);
                });
                }
                // console.log('a:'+Date.now());
            }
            else{
                if(!cut_corner_end){
                    cut_corner_end=true;
                    let vertices_arr=[];
                    vertices_arr[0]=create_vertices(bangliao_r1,bangliao_r1,bangliao_length-cut_length).vertices;
                    vertices_arr[1]=create_vertices(bangliao_r1,bangliao_r2,cut_length).vertices;
                    vertices_arr[2]=create_vertices(bangliao_r2,bangliao_r2,bangliao_length).vertices;
                    // vertices_arr[3]=create_vertices(bangliao_r2,bangliao_r2,0.3).vertices;
                    for(let i=0;i<3;i++){
                        bangliao[i].children.forEach(function (e) {
                        e.geometry.vertices = vertices_arr[i];
                        e.geometry.verticesNeedUpdate = true;//通知顶点更新
                        e.geometry.elementsNeedUpdate = true;//特别重要，通知线条连接方式更新
                        e.geometry.computeFaceNormals();
                    });
                }

                }
                let vertices_arr=[];
                vertices_arr[0]=create_vertices(bangliao_r1,bangliao_r1,bangliao_length-cut_length).vertices;
                bangliao[0].children.forEach(function (e) {
                    e.geometry.vertices = vertices_arr[0];
                    e.geometry.verticesNeedUpdate = true;//通知顶点更新
                    e.geometry.elementsNeedUpdate = true;//特别重要，通知线条连接方式更新
                    e.geometry.computeFaceNormals();
                    
                });
            }
           
        }
        




        bangliao[0].position.y=-65;
        bangliao[1].position.y=-65-bangliao_length+cut_length+bangliao2_length;
        bangliao[2].position.y=-65;
        // bangliao[3].position.y=-65-bangliao_length+0.3;

        tool.position.y=-65-bangliao_length+cut_length-bcdl*trig('cot',main_angle)-duidaobuchang;
        tool.position.x=-bangliao_r1+bcdl;

        daojia1.position.y=-159.5-bangliao_length+cut_length-bcdl*trig('cot',main_angle)+daojujiaodubuchang-duidaobuchang;
        daojia2.position.y=-221.5-bangliao_length+cut_length-bcdl*trig('cot',main_angle)+daojujiaodubuchang-duidaobuchang;
        daojia2.position.x=-bangliao_r1+bcdl-100;

        if(model_number==9){
            load_status=true;
        }
        

        
        if(cut_length>0&&machine_speed>0){
            let x = (count != 0) ? Math.round(cut_length * 10) / 10 : 0;
            let y = cutting_force * (getNumberInNormalDistribution(1,0.03));
            if(count%10==0){
                if(count%50==0){
                    draw_chart(chart_line1,2000,x,y);
                }
                draw_chart(chart_line2,30,x,y);
            }
            count+=1;
        }  
        
    }
    catch (e) {
        console.log(e)
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

//绘制图像
function draw_chart(chart,number,x,y){
    if(chart.data.length>number){
        chart.delete_data();
    }
    chart.push_data(x,y); 
    chart.update();
}


//主函数
function threeStart() {
    //图表
    chart_line1=new chart_line('container','dark',0.5,'#6cb041','切削长度-主切削力曲线','切削长度','主切削力','mm','N',true,true,true,true,false,true);
    chart_line1.update();
    chart_line2=new chart_line('container2','dark',1,'#9999ff','','切削长度','主切削力','mm','N',true,true,true,true,true,false);
    chart_line2.update();
    //三维场景
    initThree();
    initObject();
    loadAutoScreen(camera, renderer);
    render();
}

let Main = {
    data() {
        this.openFullScreen(200);
        return {
            check_pr: false,
            check_ps: false,
            check_p0: false,
            value1: 0,
            value2: 1,
            value3: 0.3,

            src1: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1567144341452&di=a069835f0428b94979796ed1dec81c03&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2Fdbe5e3517539425899eadba77521b3ac6ba2edb810f2a-nANzc3_fw658',
            src2:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1567144597468&di=18baee6bc69c3fef33f24dec02c9ec15&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F54293f5fda82dcbdff2da781f5c821b97117d32d8a673-3aeEJ1_fw658',
            adjustable:false,
            marks_machine_speed: {
                0:'0',
                400: '400',
                800: '800',
                1200: '1200',
                1600: '1600'
            },
            marks_cutting_depth: {

                0:'0',
                1: '1.0',
                2: '2.0',
                3: '3.0',
                4: '4.0',
                5: '5.0',
                6:'6.0'
            },
            marks_feed: {
                0.1: '0.1',
                0.2: '0.2',
                0.3: '0.3',
                0.4: '0.4',
                0.5: '0.5'
            }
        }
    },

    methods: {
        greet: function (xx) {
            bcdl=this.$refs.cutting_depth.value;
        },
        start: function(){
            if(this.$refs.machine_speed.value==0){
                this.$alert('主轴转速不能为0', '操作提示', {
                    confirmButtonText: '确定',
                });
                return false;
            }
            if(this.$refs.cutting_depth.value==0){
                this.$alert('背吃刀量不能为0', '操作提示', {
                    confirmButtonText: '确定',
                });
                return false;
            }
            machine_speed=this.$refs.machine_speed.value;
            bcdl=this.$refs.cutting_depth.value;
            jjl=this.$refs.feed.value;
            this.adjustable = true;
            this.getforce();
        },
        end:function () {
            machine_speed = 0;
        },
        
        openFullScreen:function(time) {
            const loading = this.$loading({
                lock: true,
                text: '实验加载中',
                background: 'rgba(0, 0, 0, 0.92)'
            });
            setTimeout(() => {
                if(load_status){
                    loading.close();
                }
                else {
                    this.openFullScreen(200);
                }

            }, time);
        },
        reload: function () {
            location.reload();
        },
        // 更新切削力
        getforce: function () {
            //let abc = "12345";
            //发送 post 请求
            this.$http.post(
                '/vmm/cuttingforce_cal/',
                {
                    bangliao_material: bangliao_material,
                    feed_rate: this.$refs.feed.value,
                    cutting_depth: this.$refs.cutting_depth.value,
                    cutting_speed: machine_speed * bangliao_r1 * Math.PI / 1000,
                    tool_cutting_edge_angle: main_angle,
                    rake_angle: rake_angle,
                },
                { emulateJSON: true }
                ).then(function (res) {
                cutting_force=res.body;
                console.log('切削力:'+cutting_force);
                });
        }

    }

}
var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')


//获取url参数
function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}

function initStats() {

    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '95%';

    document.getElementById("Stats-output").appendChild(stats.domElement);

    return stats;
}

//正态分布随机数
function getNumberInNormalDistribution(mean, std_dev) {
    return mean + (randomNormalDistribution() * std_dev);

    function randomNormalDistribution() {
        var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
        do {
            //获得两个（-1,1）的独立随机变量
            u = Math.random() * 2 - 1.0;
            v = Math.random() * 2 - 1.0;
            w = u * u + v * v;
        } while (w == 0.0 || w >= 1.0)
        //这里就是 Box-Muller转换
        c = Math.sqrt((-2 * Math.log(w)) / w);
        //返回2个标准正态分布的随机数，封装进一个数组返回
        //当然，因为这个函数运行较快，也可以扔掉一个
        //return [u*c,v*c];
        return u * c;
    }
}




