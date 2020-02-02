//模型的编号，自增
let index=0;
//当前被选中的模型编号
let selected_model_index=0;

//场景名称
let view_name;

//模型列表
////模型信息列表
let models_info=[];
////模型实体列表
let models=[];

let renderer, camera, scene;
let gui = new dat.GUI();

let Main = {
    data() {
        // this.openFullScreen(200);
        return {
            views_list:[],
            view_name: '',
            view_selected: '',
            model_name: '',
            model_list: [],
            model_selected: '',
            model_to_add: '',
            X_loc: 20,
            Y_loc: 0,
            Z_loc: 0,
            X_rot: 0,
            Y_rot: 0,
            Z_rot: 0,
            enter_view_name:false,
            model_information: '',
        }
    },
    mounted:function(){
        this.get_views();

    },

    methods: {
        get_views:function(){
            this.$http.get(
                '/vmm/get_views/'
                ).then(function (res) {
                console.log(res);
                console.log(res.body);
                res.body.views.forEach(view => {
                    console.log(view.view_name);
                    this.views_list.push({value: view.view_name,label: view.view_name});
                })

            });
        },
        add_view:function(){
            let success=true;
            this.$prompt('输入场景名称（不能与现有场景名称重复，不要使用汉字）', '新建场景', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]/,
                inputErrorMessage: '名称格式不正确'
            }).then(({ value }) => {
                this.views_list.forEach(view =>{
                    console.log(view.value);
                    if(view.value==value){
                        alert("与现有场景名重复")
                        success=false;
                    }
                });
                if(success){
                    this.view_selected=value;
                    view_name=value;
                    this.views_list.push({value: value,label: value});
                    this.enter_view_name=true;
                    this.$message({
                        type: 'success',
                        message: '成功新建场景: ' + this.view_selected
                    });
                }
                
              });
        },
        select_view:function(){
            view_name=this.view_selected;
        },
        save_view_name:function(){
            if(this.view_selected==""){
                alert("没有选中任何场景")
                return false;
            }
            view_name=this.view_selected;
            this.enter_view_name=true;
            this.get_models();
        },
        upload_model:function(){
            if(view_name==undefined){
                alert("没有选中任何场景")
                return false;
            }



        },
        add_model: function () {
            if(view_name==undefined){
                alert("没有选中任何场景")
                return false;
            }
            if(this.model_name!=''){
                index+=1;
                models_info[index]=new Model(view_name,this.model_name,index);
                this.model_list.push({value: index,label: index+"-"+this.model_name})
                this.model_name='';
                initObject(index);  
                
            }
            else{
                alert('模型名称不能为空')
            }
        },
        select_model:function(sel){
            selected_model_index=sel;
            this.model_information=''
            this.model_information+='模型尺寸：'+"<br>"
            this.model_information+='X:'+(models[selected_model_index].children[0].geometry.boundingBox.max.x*2).toFixed(3) +" <br> "
            this.model_information+='--X/2:'+(models[selected_model_index].children[0].geometry.boundingBox.max.x).toFixed(3) +"  <br> "
            this.model_information+='Y:'+(models[selected_model_index].children[0].geometry.boundingBox.max.y*2).toFixed(3) +" <br>"
            this.model_information+='--Y/2:'+(models[selected_model_index].children[0].geometry.boundingBox.max.y).toFixed(3) +" <br>"
            this.model_information+='Z:'+(models[selected_model_index].children[0].geometry.boundingBox.max.z*2).toFixed(3) +" <br>"
            this.model_information+='--Z/2:'+(models[selected_model_index].children[0].geometry.boundingBox.max.z).toFixed(3) +" <br>"

            console.log(this.model_information);
        },
        save_model:function(){
            // console.log(models_info);
            let info_list=[];
            for(i=0;i<models_info.length;i++){
                if(models_info[i] != null){
                    info_list.push(models_info[i])
                }
            }
            // console.log(info_list);
            let info=JSON.stringify(info_list);
            
            this.$http.post(
                '/vmm/save_models/',
                {
                    models:info
                },
                { emulateJSON: true }
                ).then(function (res) {
                console.log(res);
                alert(res.body)
                });
        },
        get_models:function(){
            let models_got_list=[];
            this.$http.post(
                '/vmm/get_models_by_view_name/',
                {
                    view_name:this.view_selected
                },
                { emulateJSON: true }
                ).then(function (res) {
                    models_got=res.body.models;
                    models_got.forEach(model => {
                        index=Number(model.model_index);
                        models_info[index]=new Model(model.view_name,model.model_name,index);
                        // models_info[index].change_po(model.position_x,model.position_y,model.position_z)
                        models_info[index].change_po_x(model.position_x);
                        models_info[index].change_po_y(model.position_y)
                        models_info[index].change_po_z(model.position_z)

                        // models_info[index].change_ro(model.rotation_x,model.rotation_y,model.rotation_z)
                        models_info[index].change_ro_x(model.rotation_x)
                        models_info[index].change_ro_y(model.rotation_y)
                        models_info[index].change_ro_z(model.rotation_z)
                        models_info[index].change_materials_color_r(model.materials_color_r)
                        models_info[index].change_materials_color_g(model.materials_color_g)
                        models_info[index].change_materials_color_b(model.materials_color_b)
                        
                        console.log(models_info)
                        // console.log('~~~')      
                        models_got_list.push({value: index,label: index+"-"+model.model_name})
                        initObject(index);
                        // console.log(index)
                    });        
                });
            this.model_list=models_got_list;

        },
        delete_model:function(){
            scene.remove(models[selected_model_index]);
            this.model_list.forEach(function(item, index, arr) {
                if(item.value==selected_model_index) {
                    arr.splice(index, 1);
                }
            });
            // remove({value: selected_model_index,label: models_info[selected_model_index].name})
            models_info[selected_model_index]=null;
            this.$http.post(
                '/vmm/delete_model/',
                {
                    view_name:this.view_name,
                    model_index:selected_model_index
                },
                { emulateJSON: true }
            ).then(function (res){
                // console.log(res)
            })

        }

    }
}

var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')



//主函数
function threeStart() {
    initThree();
    loadAutoScreen(camera, renderer);
    change_model(selected_model_index)
    render();
}

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

    //地面
    let planeGeometry = new THREE.PlaneGeometry(5000, 5000, 20, 20);
    let planeMaterial =
        new THREE.MeshLambertMaterial({color: 0x232323})
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.z = -950;
    plane.receiveShadow = true;//开启地面的接收阴影
    scene.add(plane);//添加到场景中

    //坐标轴
    let x_zhou_Geometry = new THREE.PlaneGeometry(5000, 10, 20, 20);
    let x_zhou_Material =
        new THREE.MeshLambertMaterial({color:0xff0000})
        x_zhou = new THREE.Mesh(x_zhou_Geometry, x_zhou_Material);
    x_zhou.position.z = -930;
    x_zhou.receiveShadow = true;//开启地面的接收阴影
    scene.add(x_zhou);//添加到场景中

    let y_zhou_Geometry = new THREE.PlaneGeometry(5000, 10, 20, 20);
    let y_zhou_Material =
        new THREE.MeshLambertMaterial({color:0x0000ff})
        y_zhou = new THREE.Mesh(y_zhou_Geometry, y_zhou_Material);
    y_zhou.position.z = -930;
    y_zhou.rotation.z = Math.PI*0.5;
    y_zhou.receiveShadow = true;//开启地面的接收阴影
    scene.add(y_zhou);//添加到场景中


}

//初始化一个模型
function initObject(index) {
    //模型材质
    let color=new THREE.Color(models_info[index].materials_color_r,models_info[index].materials_color_g,models_info[index].materials_color_b);
    let materials = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: color,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ];

    
    let loader = new THREE.STLLoader();
    loader.load(models_info[index].url, function (geometry) {
        // console.log(geometry);
        geometry.center();
        models[index] = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
        models[index].receiveShadow = true; 
        models[index].position.x=models_info[index].position_x;
        models[index].position.y=models_info[index].position_y;
        models[index].position.z=models_info[index].position_z;
        models[index].rotation.x=models_info[index].rotation_x;
        models[index].rotation.y=models_info[index].rotation_y;
        models[index].rotation.z=models_info[index].rotation_z;
        models[index].scale.x=models_info[index].scale_x;
        models[index].scale.y=models_info[index].scale_y;
        models[index].scale.z=models_info[index].scale_z;

        
        scene.add(models[index]);
        // console.log(models)
        console.log(this.name+'加载完成');
    });  
}

//动画
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

//模型对象
function Model(view_name,name,index){
    this.view_name=view_name;
    this.index=index;
    this.name=name;
    this.url="/static/model/"+view_name+'/'+name;
    this.position_x=0;
    this.position_y=0;
    this.position_z=0;
    this.rotation_x=0;
    this.rotation_y=0;
    this.rotation_z=0;
    this.materials_color=0x212121;
    this.materials_color_r=0.12941176470588237;
    this.materials_color_g=0.12941176470588237;
    this.materials_color_b=0.12941176470588237;
    // 缩放比例
    this.scale_x=1;
    this.scale_y=1;
    this.scale_z=1;

   
    this.change_po_x=function(x){
        this.position_x=x;
    };
    this.change_po_y=function(y){
        this.position_y=y;
    };
    this.change_po_z=function(z){
        this.position_z=z;
    };
   
    this.change_ro_x=function(x){
        this.rotation_x=x;
    };
    this.change_ro_y=function(y){
        this.rotation_y=y;
    };
    this.change_ro_z=function(z){
        this.rotation_z=z;
    };

    this.change_materials_color_r=function(x){
        this.materials_color_r=x;
    };
    this.change_materials_color_g=function(x){
        this.materials_color_g=x;
    };
    this.change_materials_color_b=function(x){
        this.materials_color_b=x;
    };

    this.change_scale_x=function(x){
        this.scale_x=x;
    };
    this.change_scale_y=function(x){
        this.scale_y=x;
    };
    this.change_scale_z=function(x){
        this.scale_z=x;
    };
}

//调整模型位置和角度
function change_model(){
    // gui = new dat.GUI();
    let controls = new function () {
        this.x=0;
        this.y=0;
        this.z=0;
        this.mini_x=0;
        this.mini_y=0;
        this.mini_z=0;
        this.rx=0;
        this.ry=0;
        this.rz=0;
        this.m_color_r=0.12941176470588237;
        this.m_color_g=0.12941176470588237;
        this.m_color_b=0.12941176470588237;
        this.scale_x=1;
        this.scale_y=1;
        this.scale_z=1;

        this.move_x = function () {
            models[selected_model_index].position.x=controls.x+controls.mini_x;
            models_info[selected_model_index].change_po_x(controls.x+controls.mini_x)
        };
        this.move_y = function () {
            models[selected_model_index].position.y=controls.y+controls.mini_y;
            models_info[selected_model_index].change_po_y(controls.y+controls.mini_y)
           
        };
        this.move_z = function () {
            models[selected_model_index].position.z=controls.z+controls.mini_z;
            models_info[selected_model_index].change_po_z(controls.z+controls.mini_z)
        };
        this.move = function () {
            models[selected_model_index].position.x=controls.x+controls.mini_x;
            models[selected_model_index].position.y=controls.y+controls.mini_y;
            models[selected_model_index].position.z=controls.z+controls.mini_z;
            models_info[selected_model_index].change_po(controls.x+controls.mini_x,controls.y+controls.mini_y,controls.z+controls.mini_z)
            models_info[selected_model_index].change_po_x(controls.x+controls.mini_x)
            models_info[selected_model_index].change_po_y(controls.y+controls.mini_y)
            models_info[selected_model_index].change_po_z(controls.z+controls.mini_z)
        };
        this.rotate = function () {
            models[selected_model_index].rotation.x=(Math.PI/180)*controls.rx;
            models[selected_model_index].rotation.y=(Math.PI/180)*controls.ry;
            models[selected_model_index].rotation.z=(Math.PI/180)*controls.rz;
            models_info[selected_model_index].change_ro((Math.PI/180)*controls.rx,(Math.PI/180)*controls.ry,(Math.PI/180)*controls.rz)
        };
        this.rotate_x = function () {
            models[selected_model_index].rotation.x=(Math.PI/180)*controls.rx;
            models_info[selected_model_index].change_ro_x((Math.PI/180)*controls.rx)
        };
        this.rotate_y = function () {
            models[selected_model_index].rotation.y=(Math.PI/180)*controls.ry;
            models_info[selected_model_index].change_ro_y((Math.PI/180)*controls.ry)
        };
        this.rotate_z = function () {
            models[selected_model_index].rotation.z=(Math.PI/180)*controls.rz;
            models_info[selected_model_index].change_ro_z((Math.PI/180)*controls.rz)
        };
        this.materials_color_r = function () {
            models[selected_model_index].children[0].material.color.r=controls.m_color_r;
            models_info[selected_model_index].materials_color_r=controls.m_color_r;
        };
        this.materials_color_g = function () {
            models[selected_model_index].children[0].material.color.g=controls.m_color_g;
            models_info[selected_model_index].materials_color_g=controls.m_color_g;
        };
        this.materials_color_b = function () {
            models[selected_model_index].children[0].material.color.b=controls.m_color_b;
            models_info[selected_model_index].materials_color_b=controls.m_color_b;
        };
        // this.materials_color = function () {
        //     models[selected_model_index].rotation.z=(Math.PI/180)*controls.rz;
        //     models_info[selected_model_index].change_ro_z((Math.PI/180)*controls.rz)
        // };

        this.change_scale_x=function(x){
            models[selected_model_index].scale.x=controls.scale_x;
            models_info[selected_model_index].scale_x=controls.scale_x;
        };
        this.change_scale_y=function(x){
            models[selected_model_index].scale.y=controls.scale_y;
            models_info[selected_model_index].scale_y=controls.scale_y;
        };
        this.change_scale_z=function(x){
            models[selected_model_index].scale.z=controls.scale_z;
            models_info[selected_model_index].scale_z=controls.scale_z;
        };
    };
    gui.add(controls, 'x', -1000, 1000).onChange(controls.move_x);
    gui.add(controls, 'mini_x', -10, 10).onChange(controls.move_x);
    gui.add(controls, 'y', -1000, 1000).onChange(controls.move_y);
    gui.add(controls, 'mini_y', -10, 10).onChange(controls.move_y);
    gui.add(controls, 'z', -1000, 1000).onChange(controls.move_z);
    gui.add(controls, 'mini_z', -10, 10).onChange(controls.move_z);
    gui.add(controls, 'rx', -180, 180).onChange(controls.rotate_x);
    gui.add(controls, 'ry', -180, 180).onChange(controls.rotate_y);
    gui.add(controls, 'rz', -180, 180).onChange(controls.rotate_z);
    gui.add(controls, 'm_color_r', 0, 1).onChange(controls.materials_color_r);
    gui.add(controls, 'm_color_g', 0, 1).onChange(controls.materials_color_g);
    gui.add(controls, 'm_color_b', 0, 1).onChange(controls.materials_color_b);

    gui.add(controls, 'scale_x', 0, 10).onChange(controls.change_scale_x);
    gui.add(controls, 'scale_y', 0, 10).onChange(controls.change_scale_y);
    gui.add(controls, 'scale_z', 0, 10).onChange(controls.change_scale_z);
    // gui.add(controls, 'materials_specular', 0x000000, 0xffffff).onChange(controls.materials_specular);

}





