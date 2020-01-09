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
            view_name: '',
            model_name: '',
            model_list: [],
            model_selected: '',
            X_loc: 20,
            Y_loc: 0,
            Z_loc: 0,
            X_rot: 0,
            Y_rot: 0,
            Z_rot: 0,
            enter_view_name:false,
        }
    },

    methods: {
        save_view_name:function(){
            if(this.view_name==""){
                alert("场景名不能为空")
                return false;
            }
            view_name=this.view_name;
            this.enter_view_name=true;
        },
        add_model: function () {
            if(view_name==""){
                alert("场景名不能为空")
                return false;
            }
            if(this.model_name!=''){
                models_info[index]=new Model(this.model_name,index);
                this.model_list.push({value: index,label: this.model_name})
                this.model_name='';
                initObject();  
            }
            else{
                alert('模型名称不能为空')
            }
        },
        select_model:function(sel){
            selected_model_index=sel;
        },
        save_model:function(){
            let info=JSON.stringify(models_info);
            console.log(info);
            this.$http.post(
                '/vmm/save_models/',
                {
                    models:info
                },
                { emulateJSON: true }
                ).then(function (res) {
                console.log(res);
                });
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

}

//初始化一个模型
function initObject() {
    //模型材质
    let materials = [
        new THREE.MeshPhongMaterial({
            opacity: 0.6,
            color: 0x212121,
            transparent: false,
            specular: 0x545454,
            metal: true
        }),
    ];
    
    let loader = new THREE.STLLoader();
    loader.load(models_info[index].url, function (geometry) {
        geometry.center();
        models[index] = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
        models[index].receiveShadow = true; 
        scene.add(models[index]);
        console.log(this.name+'加载完成');
        index+=1;
    });  
}

//动画
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

//模型对象
function Model(name,index){
    this.view_name=view_name;
    this.index=index;
    this.name=name;
    this.url="/static/model/"+name;
    this.position_x=0;
    this.position_y=0;
    this.position_z=0;
    this.rotation_x=0;
    this.rotation_y=0;
    this.rotation_z=0;

    this.change_po=function(x,y,z){
        this.position_x=x;
        this.position_y=y;
        this.position_z=z;
    };
    this.change_ro=function(x,y,z){
        this.rotation_x=x;
        this.rotation_y=y;
        this.rotation_z=z;
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
        this.move = function () {
            models[selected_model_index].position.x=controls.x+controls.mini_x;
            models[selected_model_index].position.y=controls.y+controls.mini_y;
            models[selected_model_index].position.z=controls.z+controls.mini_z;
            models_info[selected_model_index].change_po(controls.x+controls.mini_x,controls.y+controls.mini_y,controls.z+controls.mini_z)
        };
        this.rotate = function () {
            models[selected_model_index].rotation.x=(Math.PI/180)*controls.rx;
            models[selected_model_index].rotation.y=(Math.PI/180)*controls.ry;
            models[selected_model_index].rotation.z=(Math.PI/180)*controls.rz;
            models_info[selected_model_index].change_ro((Math.PI/180)*controls.rx,(Math.PI/180)*controls.ry,(Math.PI/180)*controls.rz)
        };
    };
    gui.add(controls, 'x', -200, 200).onChange(controls.move);
    gui.add(controls, 'mini_x', -10, 10).onChange(controls.move);
    gui.add(controls, 'y', -200, 200).onChange(controls.move);
    gui.add(controls, 'mini_y', -10, 10).onChange(controls.move);
    gui.add(controls, 'z', -200, 200).onChange(controls.move);
    gui.add(controls, 'mini_z', -10, 10).onChange(controls.move);
    gui.add(controls, 'rx', -180, 180).onChange(controls.rotate);
    gui.add(controls, 'ry', -180, 180).onChange(controls.rotate);
    gui.add(controls, 'rz', -180, 180).onChange(controls.rotate);

}


