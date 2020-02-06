//模型的编号，自增
let index=0;
//当前被选中的模型编号
let current_model_index=0;

//当前被选中的模型id
let current_model_id=0;

//场景名称
let view_name;

//当前被选中的view_id
let current_view_id;

//是否开始自动保存
auto_save_status=0;

//模型列表
////模型信息列表
let models_info=[];
////模型实体列表
let models=[];

// //当前子场景模型列表
// let models_in_childView_list=[];

let renderer, camera, scene;
let gui = new dat.GUI();

let load_models_num;
let loaded_models_num=0;
let load_status=false;


let Main = {
    data() {
        // this.openFullScreen(200);
        return {
            views_list:[],
            // view_name: '',
            view_selected: '',
            child_view_list:[],
            child_view_selected: '',
            model_name: '',
            model_url:'',
            model_list: [],
            model_selected: '',
            model_to_add: '',
            folder_list: [],
            folder_selected: '',
            model_in_folder_selected:'',
            model_in_folder_list:[],
            model_in_folder_material:0,
            X_loc: 20,
            Y_loc: 0,
            Z_loc: 0,
            X_rot: 0,
            Y_rot: 0,
            Z_rot: 0,
            enter_view_name:false,
            model_information: '',
            child_view_status:true,
            add_model_status:true,
            del_model_status:true,
        }
    },
    mounted:function(){
        this.get_views();
        this.get_folders();
        this.timer = setInterval(this.auto_save, 20000);
    },
    methods: {
        auto_save:function(){
            if(auto_save_status==1){
                this.save_model();
            }

        },
        get_views:function(){
            this.$http.get(
                '/vmm/get_views/'
                ).then(function (res) {
                this.views_list=[];
                res.body.views.forEach(view => {
                    this.views_list.push({value: view.id,label: view.view_name});
                })

            });
        },
        get_child_views:function(){
            this.$http.post(
                '/vmm/get_views/',
                {
                    parent_id:current_view_id
                },
                { emulateJSON: true }
                ).then(function (res) {
                this.child_view_list=[];
                res.body.views.forEach(view => {
                    this.child_view_list.push({value: view.id,label: view.view_name});
                })


            });
        },
        add_view:function(){
            if(this.view_selected==''){
                this.view_selected=0;
            }
            this.$prompt('输入场景名称（不能与现有场景名称重复，不要使用汉字）', '新建场景', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]/,
                inputErrorMessage: '名称格式不正确'
            }).then(({ value }) => {
                // this.views_list.forEach(view =>{
                //     if(view.value==value){
                //         this.$message({
                //             type: 'error',
                //             duration: 2000,
                //             message: "与现有场景名重复"
                //         });
                //         success=false;
                //     }
                // });
                this.$http.post(
                    '/vmm/is_view_exist/',
                    {
                        view_name:value
                    },
                    { emulateJSON: true }
                    ).then(function (res) {
                        if(res.body=='true'){
                            this.$message({
                                type: 'error',
                                duration: 2000,
                                message: "与现有场景名重复"
                            });
                            success=false;
                        }                        
                        else{
                            this.$http.post(
                                '/vmm/add_view/',
                                {
                                    view_name:value,
                                    parent_id:this.view_selected
                                },
                                { emulateJSON: true }
                                ).then(function (res) {
                                    this.$message({
                                        type: 'success',
                                        message: res.body
                                    });
                                    this.get_views();
                                    if(this.view_selected!=0){
                                        this.get_child_views();
                                    }
                                });                   
                        }
                        
                    });   
            });
        },
        select_view:function(){
            if(this.view_selected==''){
                this.view_selected=0;
            }
            current_view_id=this.view_selected;
        },
        select_model:function(sel){
            auto_save_status=1;
            current_model_index=sel;
            this.model_information=''
            // </td><td></td></tr></table>'
            this.model_information+="<br>"+'模型尺寸：'+"<br>"
            this.model_information+='<table><tr><td>'+'X:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.x*2).toFixed(3) +"</td>"
            this.model_information+='<td>>>>> X/2:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.x).toFixed(3) +"</td></tr>"
            this.model_information+='<tr><td>Y:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.y*2).toFixed(3) +"</td>"
            this.model_information+='<td>>>>> Y/2:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.y).toFixed(3) +"</td></tr>"
            this.model_information+='<tr><td>Z:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.z*2).toFixed(3) +"</td>"
            this.model_information+='<td>>>>> Z/2:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.z).toFixed(3) +"</td></tr>"

            //console.log(this.model_information);
            this.del_model_status=false;
        },
       
        upload_view:function(){
            if(this.view_selected==''){
                alert("没有选中任何场景")
                return false;
            }
            this.enter_view_name=true;
            this.get_models();
        },
        // 根据场景的ID加载场景中的模型
        get_models:function(){
            let models_got_list=[];
            this.$http.post(
                '/vmm/get_models_by_view/',
                {
                    view_id:current_view_id
                },
                { emulateJSON: true }
                ).then(function (res) {
                    models_got=res.body.models;
                    load_models_num=models_got.length;
                    //console.log(models_got);
                    models_got.forEach(model => {
                        index=Number(model.serial);
                        models_info[index]=new Model(model.view_id,model.model_id,model.model_name,model.model_url,index,model.materials_type);
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

                        models_info[index].change_metalness(model.metalness)
                        models_info[index].change_roughness(model.roughness)
                        models_info[index].change_emissive_r(model.emissive_r)
                        models_info[index].change_emissive_g(model.emissive_g)
                        models_info[index].change_emissive_b(model.emissive_b)
                        models_info[index].change_emissiveIntensity(model.emissiveIntensity)
                        models_info[index].change_reflectivity(model.reflectivity)
                        
                        //console.log(models_info)
                        // //console.log('~~~') 
                        ////////////////////////////////////////////////////////////////////////////////  
                        // models_got_list.push({value: index,label: index+"-"+model.model_name})
                        initObject(index,model.materials_type);
                        // //console.log(index)
                    });        
                });
            this.model_list=models_got_list;
        },
        get_models_by_child_view:function(){
            
            if(this.child_view_selected==''){
                this.child_view_selected=0
            }
            current_view_id=this.child_view_selected;
            let models_got_list=[];
            this.$http.post(
                '/vmm/get_models_by_view/',
                {
                    view_id:current_view_id
                },
                { emulateJSON: true }
                ).then(function (res) {
                    models_got=res.body.models;
                    //console.log(models_got);
                    models_got.forEach(model => {
                        index=Number(model.serial);
                        models_info[index]=new Model(model.view_id,model.model_id,model.model_name,model.model_url,index,model.materials_type);
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

                        models_info[index].change_metalness(model.metalness)
                        models_info[index].change_roughness(model.roughness)
                        models_info[index].change_emissive_r(model.emissive_r)
                        models_info[index].change_emissive_g(model.emissive_g)
                        models_info[index].change_emissive_b(model.emissive_b)
                        models_info[index].change_emissiveIntensity(model.emissiveIntensity)
                        models_info[index].change_reflectivity(model.reflectivity)
                        models_got_list.push({value: index,label: index+"-"+model.model_name})
                        // initObject(index,model.materials_type);
                        // //console.log(index)
                    });        
                });
            this.model_list=models_got_list;
            this.add_model_status=false;
            auto_save_status=1;

        },
        save_model:function(){
            // //console.log(models_info);
            let info_list=[];
            for(i=0;i<models_info.length;i++){
                if(models_info[i] != null){
                    info_list.push(models_info[i])
                }
            }
            // //console.log(info_list);
            let info=JSON.stringify(info_list);
            // //console.log(info)
            this.$http.post(
                '/vmm/save_models/',
                {
                    models:info
                },
                { emulateJSON: true }
                ).then(function (res) {
                // //console.log(res);
                this.$message({
                    type: 'success',
                    duration: 1000,
                    position: 'top-left',
                    message: "保存完成"
                });
                });
        },
        delete_model:function(){
            scene.remove(models[current_model_index]);
            this.model_list.forEach(function(item, index, arr) {
                if(item.value==current_model_index) {
                    arr.splice(index, 1);
                }
            });
            // remove({value: current_model_index,label: models_info[current_model_index].name})
            models_info[current_model_index]=null;
            this.$http.post(
                '/vmm/delete_model/',
                {
                    view_id:current_view_id,
                    model_index:current_model_index
                },
                { emulateJSON: true }
            ).then(function (res){
                //console.log(res)
            })

        },
        save_view_name:function(){
            this.openFullScreen(200);
            this.child_view_status=false;
            if(this.view_selected==''){
                alert("没有选中任何场景")
                return false;
            }
            view_name=this.view_selected;
            this.enter_view_name=true;
            this.get_models();
            this.get_child_views();
        },
        // upload_model:function(){
        //     if(view_name==undefined){
        //         alert("没有选中任何场景")
        //         return false;
        //     }
        // },
        add_model: function () {
            load_status=false;
            this.openFullScreen(200);
            load_models_num=1;
            loaded_models_num=0;
            if(view_name==undefined){
                alert("请载入场景")
                return false;
            }
            if(this.folder_selected==''){
                alert("请选择文件夹")
                return false;
            }
            if(this.model_in_folder_selected==''){
                alert("请选择模型")
                return false;
            }
            // if(this.model_in_folder_material==0){
            //     alert("请指定模型材质")
            //     return false;
            // }
            
            if(this.model_in_folder_selected!=''){
                this.$http.post(
                    '/vmm/get_model_info_by_id/',
                    {
                        model_id:this.model_in_folder_selected,
                    },
                    { emulateJSON: true }
                ).then(function (res){
                    //console.log(res.body.model[0]);
                    let model_id=res.body.model[0].id;
                    let model_name=res.body.model[0].model_name;
                    let url=res.body.model[0].url
                    index+=1;
                    models_info[index]=new Model(current_view_id,model_id,model_name,url,index,this.model_in_folder_material);
                    this.model_list.push({value: index,label: index+"-"+model_name})
                    this.model_name='';
                    initObject(index,this.model_in_folder_material); 
                })

                 
                
            }
            else{
                alert('模型名称不能为空')
            }
        },
        
        
        
        
        get_folders:function(){
            this.$http.get(
                '/vmm/get_folders/'
                ).then(function (res) {
                //console.log(res);
                //console.log(res.body);
                res.body.folders.forEach(folder => {
                    //console.log(folder.folder_name);
                    this.folder_list.push({value: folder.id,label: folder.folder_name});
                })

            });
        },
        get_models_by_folder:function(){
            //console.log(this.folder_selected);
            this.$http.post(
                '/vmm/get_model_by_folderid/',
                {
                    folder_id:this.folder_selected
                },
                { emulateJSON: true }
                ).then(function (res) {
                    this.model_in_folder_list=[];
                    res.body.models.forEach(model => {
                        this.model_in_folder_list.push({value: model.id,label: model.model_name});
                })

            });
        },
        //根据准备添加的模型的id获取模型的信息
        get_model_info_by_id:function(){
            this.$http.post(
                '/vmm/get_model_info_by_id/',
                {
                    model_id:this.model_in_folder_selected
                },
                { emulateJSON: true }
                ).then(function (res) {
                    //console.log(res.body.model[0].url);
                    this.model_url=res.body.model[0].url;
            });
        },
        to_manage_models:function(){
            window.open('/vmm/model_manage/');
        },
        // 加载遮罩
        openFullScreen:function(time) {
            const loading = this.$loading({
                lock: true,
                text: '模型加载中',
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

    }
}

var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')



//主函数
function threeStart() {
    initThree();
    loadAutoScreen(camera, renderer);
    change_model(current_model_index)
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

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 500000);//perspective是透视摄像机，这种摄像机看上去画面有3D效果

    //摄像机的位置
    camera.position.x = -3000;
    camera.position.y = -3000;
    camera.position.z = 1000;
    camera.up.x = 0;
    camera.up.y = 0;
    camera.up.z = 1;//摄像机的上方向是Z轴
    camera.lookAt(0, -50, 0);//摄像机对焦的位置
    //这三个参数共同作用才能决定画面

    scene = new THREE.Scene();

    // let directionalLight=new THREE.DirectionalLight("#ffffff");
    // let hemiLight=new THREE.HemisphereLight(0xffffff,0xffffff,0.6);
    // hemiLight.position.set(1000,1000,1000);
    // scene.add(hemiLight);


    let light = new THREE.SpotLight(0xffffff, 1, 0);//点光源
    light.position.set(0, 0, 80000);
    light.angle=Math.PI;
    light.castShadow = true;//开启阴影
    light.shadowMapWidth = 8192;//阴影的分辨率，可以不设置对比看效果
    light.shadowMapHeight = 8192;
    scene.add(light);

    let light2 = new THREE.SpotLight(0xffffff, 0.4, 0);//点光源
    light2.position.set(80000,-80000,300);
    scene.add(light2);

    let light3 = new THREE.SpotLight(0xffffff, 0.4, 0);//点光源
    light3.position.set(80000,80000,300);
    scene.add(light3);

    let light4 = new THREE.SpotLight(0xffffff, 0.4, 0);//点光源
    light4.position.set(-80000,-80000,300);
    scene.add(light4);

    let light6 = new THREE.SpotLight(0xffffff, 0.4, 0);//点光源
    light6.position.set(-80000,80000,300);
    scene.add(light6);

    let light5 = new THREE.AmbientLight(0xaaaaaa, 0.99);//环境光，如果不加，点光源照不到的地方就完全是黑色的
    scene.add(light5);

    let controller = new THREE.OrbitControls(camera, renderer.domElement);
    controller.target = new THREE.Vector3(0, 0, 0);

    //地面
    // let planeGeometry = new THREE.PlaneGeometry(50000, 50000, 20, 20);
    // let planeMaterial =
    //     new THREE.MeshLambertMaterial({color: 0x000000,transparent:true,opacity:0.5})
    // plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.position.z = -950;
    // plane.receiveShadow = true;//开启地面的接收阴影
    // scene.add(plane);//添加到场景中
    for(let i=0;i<=50000;i+=500){
        let x_zhou_Geometry = new THREE.PlaneGeometry(50000, 5, 20, 20);
        let x_zhou_Material =
            new THREE.MeshLambertMaterial({color: 0x000000,transparent:true,opacity:0.7,side:THREE.DoubleSide})
            x_zhou = new THREE.Mesh(x_zhou_Geometry, x_zhou_Material);
        x_zhou.position.z = -1000;
        x_zhou.position.y = 25000-i;
        // x_zhou.receiveShadow = true;//开启地面的接收阴影
        scene.add(x_zhou);//添加到场景中

        let y_zhou_Geometry = new THREE.PlaneGeometry(50000, 5, 20, 20);
        let y_zhou_Material =
            new THREE.MeshLambertMaterial({color: 0x000000,transparent:true,opacity:0.7,side:THREE.DoubleSide})
            y_zhou = new THREE.Mesh(y_zhou_Geometry, y_zhou_Material);
        y_zhou.position.z = -1000;
        y_zhou.rotation.z = Math.PI*0.5;
        y_zhou.position.x = 25000-i;
        y_zhou.receiveShadow = true;//开启地面的接收阴影
        scene.add(y_zhou);//添加到场景中
    }

    //坐标轴
    let x_zhou_Geometry = new THREE.PlaneGeometry(50000, 30, 20, 20);
    let x_zhou_Material =
        new THREE.MeshLambertMaterial({color:0xff0000})
        x_zhou = new THREE.Mesh(x_zhou_Geometry, x_zhou_Material);
    x_zhou.position.z = -995;
    x_zhou.receiveShadow = true;//开启地面的接收阴影
    scene.add(x_zhou);//添加到场景中

    let y_zhou_Geometry = new THREE.PlaneGeometry(50000, 30, 20, 20);
    let y_zhou_Material =
        new THREE.MeshLambertMaterial({color:0x0000ff})
        y_zhou = new THREE.Mesh(y_zhou_Geometry, y_zhou_Material);
    y_zhou.position.z = -995;
    y_zhou.rotation.z = Math.PI*0.5;
    y_zhou.receiveShadow = true;//开启地面的接收阴影
    scene.add(y_zhou);//添加到场景中


}

//初始化一个模型
function initObject(index,materials_type) {
    //模型材质
    let color=new THREE.Color(models_info[index].materials_color_r,models_info[index].materials_color_g,models_info[index].materials_color_b);
    let emissive_color=new THREE.Color(models_info[index].emissive_r,models_info[index].emissive_g,models_info[index].emissive_b);
    let materials;
    materials = [
        new THREE.MeshPhysicalMaterial({
            color:color,
            // 材质像金属的程度. 非金属材料，如木材或石材，使用0.0，金属使用1.0，中间没有（通常）.
            // 默认 0.5. 0.0到1.0之间的值可用于生锈的金属外观
            metalness: models_info[index].metalness,
            // 材料的粗糙程度. 0.0表示平滑的镜面反射，1.0表示完全漫反射. 默认 0.5
            roughness: models_info[index].roughness,
            // 设置环境贴图
            // envMap: textureCube,
            // 反射程度, 从 0.0 到1.0.默认0.5.
            // 这模拟了非金属材料的反射率。 当metalness为1.0时无效
            reflectivity: models_info[index].reflectivity,
            emissive:emissive_color,
            emissiveIntensity:models_info[index].emissiveIntensity,
            }),
    ];

    let loader = new THREE.STLLoader();
    loader.load(models_info[index].url, function (geometry) {
        // //console.log(geometry);
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
        // //console.log(models)
        //console.log(this.name+'加载完成');
        loaded_models_num+=1;
        if(loaded_models_num==load_models_num){
            load_status=true;
        }
    });  
}

//动画
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

//模型对象
function Model(view_id,model_id,model_name,url,index,materials_type){
    this.view_id=view_id;
    this.index=index;
    this.model_id=model_id;
    this.model_name=model_name;
    this.url=url;
    // this.url="/static/model/"+view_name+'/'+name;
    this.position_x=0;
    this.position_y=0;
    this.position_z=0;
    this.rotation_x=0;
    this.rotation_y=0;
    this.rotation_z=0;

    this.materials_type=materials_type;

    // 材质参数
    ////材质金属性
    this.metalness=1.0;
    ////材质粗糙度（从镜面反射到漫反射）
    this.roughness=0.5;
    ////材质在光线下的颜色，不是材质本身的颜色
    this.materials_color=0x212121;
    this.materials_color_r=0.12941176470588237;
    this.materials_color_g=0.12941176470588237;
    this.materials_color_b=0.12941176470588237;
    ////材质本身的颜色，与光线无关
    this.emissive_r=1.0;
    this.emissive_g=1.0;
    this.emissive_b=1.0;
    ////材质本身颜色的强度
    this.emissiveIntensity=0.1;
    ////非金属材料的反射率。 当metalness为1.0时无效
    this.reflectivity=0.5;


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
    this.change_materials_type=function(x){
        this.materials_type=x;
    };



    this.change_metalness=function(x){
        this.metalness=x;
    };
    this.change_roughness=function(x){
        this.roughness=x;
    };
    this.change_emissive_r=function(x){
        this.emissive_r=x;
    };
    this.change_emissive_g=function(x){
        this.emissive_g=x;
    };
    this.change_emissive_b=function(x){
        this.emissive_b=x;
    };
    this.change_emissiveIntensity=function(x){
        this.emissiveIntensity=x;
    };
    this.change_reflectivity=function(x){
        this.reflectivity=x;
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
        this.model_red=0.12941176470588237;
        this.model_green=0.12941176470588237;
        this.model_blue=0.12941176470588237;
        this.scale_x=1;
        this.scale_y=1;
        this.scale_z=1;

        ////材质金属性
        this.metalness=1.0;
        ////材质粗糙度（从镜面反射到漫反射）
        this.roughness=0.5;
        ////材质本身的颜色，与光线无关
        this.emissive_r=1.0;
        this.emissive_g=1.0;
        this.emissive_b=1.0;
        ////材质本身颜色的强度
        this.emissiveIntensity=0.1;
        ////非金属材料的反射率。 当metalness为1.0时无效
        this.reflectivity=0.5;

        //子场景整体移动
        this.all_mov_x=0;
        this.all_mov_x_last=0;
        this.all_mov_y=0;
        this.all_mov_y_last=0;
        this.all_mov_z=0;
        this.all_mov_z_last=0;


        this.move_x = function () {
            models[current_model_index].position.x=controls.x+controls.mini_x;
            models_info[current_model_index].change_po_x(controls.x+controls.mini_x)
        };
        this.move_y = function () {
            models[current_model_index].position.y=controls.y+controls.mini_y;
            models_info[current_model_index].change_po_y(controls.y+controls.mini_y)
           
        };
        this.move_z = function () {
            models[current_model_index].position.z=controls.z+controls.mini_z;
            models_info[current_model_index].change_po_z(controls.z+controls.mini_z)
        };
        this.move = function () {
            models[current_model_index].position.x=controls.x+controls.mini_x;
            models[current_model_index].position.y=controls.y+controls.mini_y;
            models[current_model_index].position.z=controls.z+controls.mini_z;
            models_info[current_model_index].change_po(controls.x+controls.mini_x,controls.y+controls.mini_y,controls.z+controls.mini_z)
            models_info[current_model_index].change_po_x(controls.x+controls.mini_x)
            models_info[current_model_index].change_po_y(controls.y+controls.mini_y)
            models_info[current_model_index].change_po_z(controls.z+controls.mini_z)
        };
        this.rotate = function () {
            models[current_model_index].rotation.x=(Math.PI/180)*controls.rx;
            models[current_model_index].rotation.y=(Math.PI/180)*controls.ry;
            models[current_model_index].rotation.z=(Math.PI/180)*controls.rz;
            models_info[current_model_index].change_ro((Math.PI/180)*controls.rx,(Math.PI/180)*controls.ry,(Math.PI/180)*controls.rz)
        };
        this.rotate_x = function () {
            models[current_model_index].rotation.x=(Math.PI/180)*controls.rx;
            models_info[current_model_index].change_ro_x((Math.PI/180)*controls.rx)
        };
        this.rotate_y = function () {
            models[current_model_index].rotation.y=(Math.PI/180)*controls.ry;
            models_info[current_model_index].change_ro_y((Math.PI/180)*controls.ry)
        };
        this.rotate_z = function () {
            models[current_model_index].rotation.z=(Math.PI/180)*controls.rz;
            models_info[current_model_index].change_ro_z((Math.PI/180)*controls.rz)
        };
        this.materials_color_r = function () {
            models[current_model_index].children[0].material.color.r=controls.model_red;
            models_info[current_model_index].materials_color_r=controls.model_red;
        };
        this.materials_color_g = function () {
            models[current_model_index].children[0].material.color.g=controls.model_green;
            models_info[current_model_index].materials_color_g=controls.model_green;
        };
        this.materials_color_b = function () {
            models[current_model_index].children[0].material.color.b=controls.model_blue;
            models_info[current_model_index].materials_color_b=controls.model_blue;
        };
        // this.materials_color = function () {
        //     models[current_model_index].rotation.z=(Math.PI/180)*controls.rz;
        //     models_info[current_model_index].change_ro_z((Math.PI/180)*controls.rz)
        // };

        this.change_scale_x=function(x){
            models[current_model_index].scale.x=controls.scale_x;
            models_info[current_model_index].scale_x=controls.scale_x;
        };
        this.change_scale_y=function(x){
            models[current_model_index].scale.y=controls.scale_y;
            models_info[current_model_index].scale_y=controls.scale_y;
        };
        this.change_scale_z=function(x){
            models[current_model_index].scale.z=controls.scale_z;
            models_info[current_model_index].scale_z=controls.scale_z;
        };

        this.change_metalness = function () {
            models[current_model_index].children[0].material.metalness=controls.metalness;
            models_info[current_model_index].metalness=controls.metalness;
        };
        this.change_roughness = function () {
            models[current_model_index].children[0].material.roughness=controls.roughness;
            models_info[current_model_index].roughness=controls.roughness;
        };

        this.change_emissive_r = function () {
            models[current_model_index].children[0].material.emissive.r=controls.emissive_r;
            models_info[current_model_index].emissive_r=controls.emissive_r;
        };
        this.change_emissive_g = function () {
            models[current_model_index].children[0].material.emissive.g=controls.emissive_g;
            models_info[current_model_index].emissive_g=controls.emissive_g;
        };
        this.change_emissive_b = function () {
            models[current_model_index].children[0].material.emissive.b=controls.emissive_b;
            models_info[current_model_index].emissive_b=controls.emissive_b;
        };

        this.change_emissiveIntensity = function () {
            models[current_model_index].children[0].material.emissiveIntensity=controls.emissiveIntensity;
            models_info[current_model_index].emissiveIntensity=controls.emissiveIntensity;
        };
        this.change_reflectivity = function () {
            models[current_model_index].children[0].material.reflectivity=controls.reflectivity;
            models_info[current_model_index].reflectivity=controls.reflectivity;
        };

        this.change_all_mov_x = function () {
            let step=controls.all_mov_x-controls.all_mov_x_last;
            controls.all_mov_x_last=controls.all_mov_x;
            for(i=0;i<models_info.length;i++){
                if(models_info[i]){
                    if(models_info[i].view_id==current_view_id){
                        models[i].position.x+=step;
                        models_info[i].change_po_x( models_info[i].position_x+step)
                    }
                }   
            }
        };
        this.change_all_mov_y = function () {
            let step=controls.all_mov_y-controls.all_mov_y_last;
            controls.all_mov_y_last=controls.all_mov_y;
            for(i=0;i<models_info.length;i++){
                if(models_info[i]){
                    if(models_info[i].view_id==current_view_id){
                        models[i].position.y+=step;
                        models_info[i].change_po_y( models_info[i].position_y+step)
                    }
                }   
            }
        };

        this.change_all_mov_z = function () {
            let step=controls.all_mov_z-controls.all_mov_z_last;
            controls.all_mov_z_last=controls.all_mov_z;
            for(i=0;i<models_info.length;i++){
                if(models_info[i]){
                    if(models_info[i].view_id==current_view_id){
                        models[i].position.z+=step;
                        models_info[i].change_po_z( models_info[i].position_z+step)
                    }
                }   
            }
        };





    };
    gui.add(controls, 'x', -25000, 25000).onChange(controls.move_x);
    gui.add(controls, 'mini_x', -10, 10).onChange(controls.move_x);
    gui.add(controls, 'y', -25000, 25000).onChange(controls.move_y);
    gui.add(controls, 'mini_y', -10, 10).onChange(controls.move_y);
    gui.add(controls, 'z', -25000, 25000).onChange(controls.move_z);
    gui.add(controls, 'mini_z', -10, 10).onChange(controls.move_z);
    gui.add(controls, 'rx', -180, 180).onChange(controls.rotate_x);
    gui.add(controls, 'ry', -180, 180).onChange(controls.rotate_y);
    gui.add(controls, 'rz', -180, 180).onChange(controls.rotate_z);
    gui.add(controls, 'scale_x', 0, 10).onChange(controls.change_scale_x);
    gui.add(controls, 'scale_y', 0, 10).onChange(controls.change_scale_y);
    gui.add(controls, 'scale_z', 0, 10).onChange(controls.change_scale_z);
    
    gui.add(controls, 'model_red', 0, 1).onChange(controls.materials_color_r);
    gui.add(controls, 'model_green', 0, 1).onChange(controls.materials_color_g);
    gui.add(controls, 'model_blue', 0, 1).onChange(controls.materials_color_b);

   

    gui.add(controls, 'metalness', 0, 1).onChange(controls.change_metalness);
    gui.add(controls, 'roughness', 0, 1).onChange(controls.change_roughness);
    gui.add(controls, 'emissive_r', 0, 1).onChange(controls.change_emissive_r);
    gui.add(controls, 'emissive_g', 0, 1).onChange(controls.change_emissive_g);
    gui.add(controls, 'emissive_b', 0, 1).onChange(controls.change_emissive_b);
    gui.add(controls, 'emissiveIntensity', 0, 1).onChange(controls.change_emissiveIntensity);
    gui.add(controls, 'reflectivity', 0, 1).onChange(controls.change_reflectivity);

    gui.add(controls, 'all_mov_x', -50000, 50000).onChange(controls.change_all_mov_x);
    gui.add(controls, 'all_mov_y', -50000, 50000).onChange(controls.change_all_mov_y);
    gui.add(controls, 'all_mov_z', -50000, 50000).onChange(controls.change_all_mov_z);
    
    


    
    // gui.add(controls, 'materials_specular', 0x000000, 0xffffff).onChange(controls.materials_specular);

}





