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
// let gui = new dat.GUI();
let model_gui;
let child_view_gui;

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
            display_status:true,
            save_status:true,
            display_view_id:0,
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
        get_child_views:function(parent_view_id){
            this.$http.post(
                '/vmm/get_views/',
                {
                    parent_id:parent_view_id
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
                                        this.get_child_views(this.view_selected);
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
            this.model_information+='<td> X/2:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.x).toFixed(3) +"</td></tr>"
            this.model_information+='<tr><td>Y:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.y*2).toFixed(3) +"</td>"
            this.model_information+='<td> Y/2:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.y).toFixed(3) +"</td></tr>"
            this.model_information+='<tr><td>Z:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.z*2).toFixed(3) +"</td>"
            this.model_information+='<td> Z/2:'+'</td><td>'+(models[current_model_index].children[0].geometry.boundingBox.max.z).toFixed(3) +"</td></tr>"

            ////console.log(this.model_information);
            this.del_model_status=false;
            change_model(
                models_info[current_model_index].model_name,
                models_info[current_model_index].position_x,models_info[current_model_index].position_y,models_info[current_model_index].position_z,
                models_info[current_model_index].rotation_x*(180/Math.PI),models_info[current_model_index].rotation_y*(180/Math.PI),models_info[current_model_index].rotation_z*(180/Math.PI),
                models_info[current_model_index].scale_x,models_info[current_model_index].scale_y,models_info[current_model_index].scale_z,
                models_info[current_model_index].metalness,
                models_info[current_model_index].roughness,
                models_info[current_model_index].materials_color_r,
                models_info[current_model_index].materials_color_g,
                models_info[current_model_index].materials_color_b,
                models_info[current_model_index].emissive_r,
                models_info[current_model_index].emissive_g,
                models_info[current_model_index].emissive_b,
                models_info[current_model_index].emissiveIntensity,
                models_info[current_model_index].reflectivity)
            // function change_model(,,model_red,model_green,model_blue,emissive_r,emissive_g,emissive_b,emissiveIntensity,reflectivity){models_info[current_model_index].

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
                    if(load_models_num>loaded_models_num){
                        this.openFullScreen(200);
                    }
                    ////console.log(models_got);
                    models_got.forEach(model => {
                        index=Number(model.serial);
                        models_info[index]=new Model(model.view_id,model.model_id,model.model_name,model.model_url,index,model.materials_type);
                        // models_info[index].change_po(model.position_x,model.position_y,model.position_z)
                        models_info[index].change_po_x(model.position_x);
                        models_info[index].change_po_y(model.position_y);
                        models_info[index].change_po_z(model.position_z);
                        
                        models_info[index].change_view_po_x(model.view_position_x);
                        models_info[index].change_view_po_y(model.view_position_y);
                        models_info[index].change_view_po_z(model.view_position_z);
                        

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
                        models_info[index].change_scale_x(model.scale_x)
                        models_info[index].change_scale_y(model.scale_y)
                        models_info[index].change_scale_z(model.scale_z)
                        
                        ////console.log(models_info)
                        // ////console.log('~~~') 
                        ////////////////////////////////////////////////////////////////////////////////  
                        // models_got_list.push({value: index,label: index+"-"+model.model_name})
                        initObject(index);
                        // ////console.log(index)
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
            let view_position_x;
            let view_position_y;
            let view_position_z;

            this.$http.post(
                '/vmm/get_models_by_view/',
                {
                    view_id:current_view_id
                },
                { emulateJSON: true }
                ).then(function (res) {
                    models_got=res.body.models;
                    view_position_x=models_got[0].view_position_x;
                    view_position_y=models_got[0].view_position_y;
                    view_position_z=models_got[0].view_position_z;

                    ////console.log(models_got);
                    models_got.forEach(model => {
                        index=Number(model.serial);
                        models_info[index]=new Model(model.view_id,model.model_id,model.model_name,model.model_url,index,model.materials_type);
                        // models_info[index].change_po(model.position_x,model.position_y,model.position_z)
                        models_info[index].change_po_x(model.position_x);
                        models_info[index].change_po_y(model.position_y)
                        models_info[index].change_po_z(model.position_z)
                        models_info[index].change_view_po_x(model.view_position_x);
                        models_info[index].change_view_po_y(model.view_position_y);
                        models_info[index].change_view_po_z(model.view_position_z);
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
                        models_info[index].change_scale_x(model.scale_x)
                        models_info[index].change_scale_y(model.scale_y)
                        models_info[index].change_scale_z(model.scale_z)
                        models_got_list.push({value: index,label: index+"-"+model.model_name})
                        // initObject(index,model.materials_type);
                        // ////console.log(index)
                    });
                    
                    this.model_list=models_got_list;
                    auto_save_status=1;
                    this.save_status=false;
                    let child_view_name;
                    this.child_view_list.forEach(view =>{
                        if(view.value==current_view_id){
                            child_view_name=view.label;
                        }
                    }); 
                    change_child_view(child_view_name,view_position_x,view_position_y,view_position_z);       
                });
            
            
            

        },
        save_model:function(){
            // ////console.log(models_info);
            let info_list=[];
            for(i=0;i<models_info.length;i++){
                if(models_info[i] != null){
                    info_list.push(models_info[i])
                }
            }
            // ////console.log(info_list);
            let info=JSON.stringify(info_list);
            // ////console.log(info)
            this.$http.post(
                '/vmm/save_models/',
                {
                    models:info
                },
                { emulateJSON: true }
                ).then(function (res) {
                // ////console.log(res);
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
                ////console.log(res)
            })

        },
        save_view_name:function(){
            if(this.view_selected==''){
                alert("没有选中任何场景")
                return false;
            }
            this.child_view_status=false;
            view_name=this.view_selected;
            this.display_view_id=this.view_selected;
            this.enter_view_name=true;
            this.display_status=false;
            this.get_models();
            this.get_child_views(view_name);
        },
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
                    ////console.log(res.body.model[0]);
                    let model_id=res.body.model[0].id;
                    let model_name=res.body.model[0].model_name;
                    let url=res.body.model[0].url
                    index+=1;
                    models_info[index]=new Model(current_view_id,model_id,model_name,url,index,this.model_in_folder_material);
                    this.model_list.push({value: index,label: index+"-"+model_name})
                    this.model_name='';
                    initObject(index); 
                })     
            }
            else{
                alert('模型名称不能为空')
            }
        },
        select_model_in_folder:function(){
            this.add_model_status=false;
        },
        get_folders:function(){
            this.$http.get(
                '/vmm/get_folders/'
                ).then(function (res) {
                ////console.log(res);
                ////console.log(res.body);
                res.body.folders.forEach(folder => {
                    ////console.log(folder.folder_name);
                    this.folder_list.push({value: folder.id,label: folder.folder_name});
                })

            });
        },
        get_models_by_folder:function(){
            ////console.log(this.folder_selected);
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
                    ////console.log(res.body.model[0].url);
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
        view_display:function(){
            let inputValue='';
            this.$http.post(
                '/vmm/get_display_view/',
                {
                    display_view_id:this.display_view_id
                },
                { emulateJSON: true }
                ).then(function (res) {
                    if(res.body.views.length != 0){
                        inputValue=res.body.views[0].display_name;
                    }
                    //console.log(inputValue)
                    this.$prompt('输入预览场景的名称', '预览设置', {
                        confirmButtonText: '预览',
                        cancelButtonText: '取消',
                        inputValue:inputValue,
                        inputPattern: /\S/,
                        inputErrorMessage: '预览名称不能为空'
                        }).then(({ value }) => {
                        this.$http.post(
                            '/vmm/create_display_view/',
                            {
                                display_view_id:this.display_view_id,
                                display_name:value
                            },
                            { emulateJSON: true }
                            ).then(function (res) {
                                if(res.body=="success"){
                                    window.open('/vmm/view_display/'+this.display_view_id);
                                }    
                        });
                        
                      }).catch(() => {
                        this.$message({
                          type: 'info',
                          message: '预览取消'
                        });       
                      });
                });   
        }

    }
}

var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')



//主函数
function threeStart() {
    initThree(1);
    loadAutoScreen(camera, renderer);
    
    render();
}

//动画
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}



//调整模型位置和角度
function change_model(model_name,x,y,z,rx,ry,rz,scale_x,scale_y,scale_z,metalness,roughness,model_red,model_green,model_blue,emissive_r,emissive_g,emissive_b,emissiveIntensity,reflectivity){
    if(model_gui){
        model_gui.destroy();
    }
    model_gui = new dat.GUI();
    model_gui.width=400; 
    let controls = new function () {
        this.model_name=model_name;
        this.x=x;
        this.y=y;
        this.z=z;
        this.mini_x=0.01;
        this.mini_y=0.01;
        this.mini_z=0.01;
        this.rx=rx;
        this.ry=ry;
        this.rz=rz;
        
        this.scale_x=scale_x;
        this.scale_y=scale_y;
        this.scale_z=scale_z;

        ////材质金属性
        this.metalness=metalness;
        ////材质粗糙度（从镜面反射到漫反射）
        this.roughness=roughness;
        ////反光颜色
        
        this.model_color=[parseInt((model_red*255).toFixed(0)),parseInt((model_green*255).toFixed(0)),parseInt((model_blue*255).toFixed(0))];
        // this.model_red=model_red;
        // this.model_green=model_green;
        // this.model_blue=model_blue;
        ////材质本身的颜色，与光线无关
        this.emissive_color=[parseInt((emissive_r*255).toFixed(0)),parseInt((emissive_g*255).toFixed(0)),parseInt((emissive_b*255).toFixed(0))];
        
        this.emissive_r=emissive_r;
        this.emissive_g=emissive_g;
        this.emissive_b=emissive_b;
        ////材质本身颜色的强度
        this.emissiveIntensity=emissiveIntensity;
        ////非金属材料的反射率。 当metalness为1.0时无效
        this.reflectivity=reflectivity;

        this.rotate_x = function () {
            if(!(isNaN(controls.rx))){
                models[current_model_index].rotation.x=(Math.PI/180)*controls.rx;
                models_info[current_model_index].change_ro_x((Math.PI/180)*controls.rx)
            }
           
        };
        this.rotate_y = function () {
            if(!(isNaN(controls.ry))){
                models[current_model_index].rotation.y=(Math.PI/180)*controls.ry;
                models_info[current_model_index].change_ro_y((Math.PI/180)*controls.ry)
            }
           
        };
        this.rotate_z = function () {
            if(!(isNaN(controls.rz))){
                models[current_model_index].rotation.z=(Math.PI/180)*controls.rz;
                models_info[current_model_index].change_ro_z((Math.PI/180)*controls.rz)
            }
            
        };

        this.change_model_color = function() {

            if(controls.model_color.length==7){

                models[current_model_index].children[0].material.color.r=parseInt(controls.model_color.substr(1,2),16)/255;
                models[current_model_index].children[0].material.color.g=parseInt(controls.model_color.substr(3,2),16)/255;
                models[current_model_index].children[0].material.color.b=parseInt(controls.model_color.substr(5,2),16)/255;
                models_info[current_model_index].materials_color_r=parseInt(controls.model_color.substr(1,2),16)/255;
                models_info[current_model_index].materials_color_g=parseInt(controls.model_color.substr(3,2),16)/255;
                models_info[current_model_index].materials_color_b=parseInt(controls.model_color.substr(5,2),16)/255;

            }
            else if(controls.model_color.length==3){
                models[current_model_index].children[0].material.color.r=controls.model_color[0]/255;
                models[current_model_index].children[0].material.color.g=controls.model_color[1]/255;
                models[current_model_index].children[0].material.color.b=controls.model_color[2]/255;
                models_info[current_model_index].materials_color_r=controls.model_color[0]/255;
                models_info[current_model_index].materials_color_g=controls.model_color[1]/255;
                models_info[current_model_index].materials_color_b=controls.model_color[2]/255;

            }
            
        };

        this.change_scale_x=function(x){
            if(!(isNaN(controls.scale_x))){
                models[current_model_index].scale.x=controls.scale_x;
                models_info[current_model_index].scale_x=controls.scale_x;
            }
        };
        this.change_scale_y=function(x){
            if(!(isNaN(controls.scale_y))){
                models[current_model_index].scale.y=controls.scale_y;
                models_info[current_model_index].scale_y=controls.scale_y;

            }            
        };
        this.change_scale_z=function(x){
            if(!(isNaN(controls.scale_z))){
                models[current_model_index].scale.z=controls.scale_z;
                models_info[current_model_index].scale_z=controls.scale_z;
            }            
        };

        this.change_metalness = function () {
            if(!(isNaN(controls.metalness))){
                models[current_model_index].children[0].material.metalness=controls.metalness;
                models_info[current_model_index].metalness=controls.metalness;
            }
        };
        this.change_roughness = function () {
            if(!(isNaN(controls.roughness))){
                models[current_model_index].children[0].material.roughness=controls.roughness;
                models_info[current_model_index].roughness=controls.roughness;
            }
        };

        this.change_emissive_color = function () {
  
            if(controls.emissive_color.length==7){

                models[current_model_index].children[0].material.emissive.r=parseInt(controls.emissive_color.substr(1,2),16)/255;
                models[current_model_index].children[0].material.emissive.g=parseInt(controls.emissive_color.substr(3,2),16)/255;
                models[current_model_index].children[0].material.emissive.b=parseInt(controls.emissive_color.substr(5,2),16)/255;
                models_info[current_model_index].emissive_r=parseInt(controls.emissive_color.substr(1,2),16)/255;
                models_info[current_model_index].emissive_g=parseInt(controls.emissive_color.substr(3,2),16)/255;
                models_info[current_model_index].emissive_b=parseInt(controls.emissive_color.substr(5,2),16)/255;

            }
            else if(controls.emissive_color.length==3){
                models[current_model_index].children[0].material.emissive.r=controls.emissive_color[0]/255;
                models[current_model_index].children[0].material.emissive.g=controls.emissive_color[1]/255;
                models[current_model_index].children[0].material.emissive.b=controls.emissive_color[2]/255;
                models_info[current_model_index].emissive_r=controls.emissive_color[0]/255;
                models_info[current_model_index].emissive_g=controls.emissive_color[1]/255;
                models_info[current_model_index].emissive_b=controls.emissive_color[2]/255;

            }

        };

        this.change_emissiveIntensity = function () {
            if(!(isNaN(controls.emissiveIntensity))){
                models[current_model_index].children[0].material.emissiveIntensity=controls.emissiveIntensity;
                models_info[current_model_index].emissiveIntensity=controls.emissiveIntensity;
            }
            
        };
        this.change_reflectivity = function () {
            if(!(isNaN(controls.reflectivity))){
                models[current_model_index].children[0].material.reflectivity=controls.reflectivity;
                models_info[current_model_index].reflectivity=controls.reflectivity;
            }

        };

        this.move_x = function () {
            //console.log(controls.x)
            if(!(isNaN(controls.x))&&!(isNaN(controls.mini_x))){
                models[current_model_index].position.x=controls.x+controls.mini_x+models_info[current_model_index].view_position_x;
                models_info[current_model_index].change_po_x(controls.x+controls.mini_x)
            }
            
        };
        this.move_y = function () {
            //console.log(controls.y)
            if(!(isNaN(controls.y))&&!(isNaN(controls.mini_y))){
                models[current_model_index].position.y=controls.y+controls.mini_y+models_info[current_model_index].view_position_y;
                models_info[current_model_index].change_po_y(controls.y+controls.mini_y)
            }
            
           
        };
        this.move_z = function () {
            //console.log(controls.z)
            if(!(isNaN(controls.z))&&!(isNaN(controls.mini_z))){
                models[current_model_index].position.z=controls.z+controls.mini_z+models_info[current_model_index].view_position_z;
                models_info[current_model_index].change_po_z(controls.z+controls.mini_z)
            }
            
        };
    }; 
    let f1 = model_gui;
    f1.add({m:''},'m').name(controls.model_name);
    let f1_1 = f1.addFolder('位置设置');
    f1_1.add(controls, 'x', -5000, 5000).name('X轴移动').onChange(controls.move_x);
    f1_1.add(controls, 'mini_x', -30, 30).step(0.01).name('X轴移动微调').onChange(controls.move_x);
    f1_1.add(controls, 'y', -5000, 5000).name('Y轴移动').onChange(controls.move_y);
    f1_1.add(controls, 'mini_y', -30, 30).step(0.01).name('Y轴移动微调').onChange(controls.move_y);
    f1_1.add(controls, 'z', -5000, 5000).name('Z轴移动').onChange(controls.move_z);
    f1_1.add(controls, 'mini_z', -30, 30).step(0.01).name('Z轴移动微调').onChange(controls.move_z);
    let f1_2 = f1.addFolder('旋转设置');
    f1_2.add(controls, 'rx', -180, 180).name('X轴旋转度数').onChange(controls.rotate_x);
    f1_2.add(controls, 'ry', -180, 180).name('Y轴旋转度数').onChange(controls.rotate_y);
    f1_2.add(controls, 'rz', -180, 180).name('Z轴旋转度数').onChange(controls.rotate_z);
    let f1_3 = f1.addFolder('缩放设置');
    f1_3.add(controls, 'scale_x', 0, 10).name('X轴缩放比例').onChange(controls.change_scale_x);
    f1_3.add(controls, 'scale_y', 0, 10).name('Y轴缩放比例').onChange(controls.change_scale_y);
    f1_3.add(controls, 'scale_z', 0, 10).name('Z轴缩放比例').onChange(controls.change_scale_z);
    let f1_4 = f1.addFolder('材质设置');
    f1_4.add(controls, 'metalness', 0, 1).name('金属质感').onChange(controls.change_metalness);
    f1_4.add(controls, 'roughness', 0, 1).name('粗糙度').onChange(controls.change_roughness);
    f1_4.add(controls, 'reflectivity', 0, 1).name('非金属反光度（金属质感=1时失效）').onChange(controls.change_reflectivity);

    f1_4.addColor(controls, 'model_color').name('反光颜色').onChange(controls.change_model_color);
    
    f1_4.addColor(controls, 'emissive_color').name('发光颜色').onChange(controls.change_emissive_color);
    
    f1_4.add(controls, 'emissiveIntensity', 0, 1).step(0.01).name('发光材质不透明度').onChange(controls.change_emissiveIntensity);
}
function change_child_view(child_view_name,x,y,z){
    if(child_view_gui){
        child_view_gui.destroy();
    }
    child_view_gui = new dat.GUI();
    child_view_gui.width=300; 
    // child_view_gui.name="子场景设置";

    let controls = new function () {
        //子场景整体移动
        this.child_view_name=child_view_name;
        this.all_mov_x=x;
        this.all_mov_x_last=0;
        this.all_mov_y=y;
        this.all_mov_y_last=0;
        this.all_mov_z=z;
        this.all_mov_z_last=0;
        this.change_all_mov_x = function () {
            if(!(isNaN(controls.all_mov_x))){
                let step=controls.all_mov_x-controls.all_mov_x_last;
                controls.all_mov_x_last=controls.all_mov_x;
                for(i=0;i<models_info.length;i++){
                    if(models_info[i]){
                        if(models_info[i].view_id==current_view_id){
                            // models_info[i].change_po_x( models_info[i].position_x+step)
                            models[i].position.x=controls.all_mov_x+models_info[i].position_x;
                            models_info[i].change_view_po_x(controls.all_mov_x)
                        }
                    }   
                }
            }
        };
        this.change_all_mov_y = function () {
            if(!(isNaN(controls.all_mov_y))){
                let step=controls.all_mov_y-controls.all_mov_y_last;
                controls.all_mov_y_last=controls.all_mov_y;
                for(i=0;i<models_info.length;i++){
                    if(models_info[i]){
                        if(models_info[i].view_id==current_view_id){
                            // models[i].position.y+=step;
                            // models_info[i].change_po_y( models_info[i].position_y+step)
                            models[i].position.y=controls.all_mov_y+models_info[i].position_y;
                            models_info[i].change_view_po_y(controls.all_mov_y)
                        }
                    }   
                }
            }

        };

        this.change_all_mov_z = function () {
            if(!(isNaN(controls.all_mov_z))){
                let step=controls.all_mov_z-controls.all_mov_z_last;
                controls.all_mov_z_last=controls.all_mov_z;
                for(i=0;i<models_info.length;i++){
                    if(models_info[i]){
                        if(models_info[i].view_id==current_view_id){
                            // models[i].position.z+=step;
                            // models_info[i].change_po_z( models_info[i].position_z+step)
                            models[i].position.z=controls.all_mov_z+models_info[i].position_z;
                            models_info[i].change_view_po_z(controls.all_mov_z)
                        }
                    }   
                }
            }  
        };
    }
    child_view_gui.add({m:''},'m').name(controls.child_view_name);
    child_view_gui.add(controls, 'all_mov_x', -25000, 25000).name('整体位置-X').onChange(controls.change_all_mov_x);
    child_view_gui.add(controls, 'all_mov_y', -25000, 25000).name('整体位置-Y').onChange(controls.change_all_mov_y);
    child_view_gui.add(controls, 'all_mov_z', -25000, 25000).name('整体位置-Z').onChange(controls.change_all_mov_z);
}





