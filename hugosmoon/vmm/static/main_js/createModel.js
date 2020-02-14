// 创建模型
function createModel(vertices,materials1,resolution){
    // 点（new THREE.Vector3(x,y,z)）-数组，材质，resolution-每一圈由多少个面组成
    let faces=[],geom,mesh;
    let height=(vertices.length-2)/resolution;

    // //上端面
    // for(let i=1;i<resolution;i++){
    //     faces.push(new THREE.Face3(0, i, i+1))
    // }
    // faces.push(new THREE.Face3(0, resolution, 1))

    // // 中间面
    // for(let j=0;j<height-1;j++){
    //     for(let i=1;i<resolution;i++){
    //         faces.push(new THREE.Face3(j*resolution+i, (j+1)*resolution+i, (j+1)*resolution+i+1));
    //         faces.push(new THREE.Face3(j*resolution+i, (j+1)*resolution+i+1, j*resolution+i+1));
    //     }
    //     faces.push(new THREE.Face3(j*resolution+1,(j+1)*resolution+resolution, (j+1)*resolution+1));
    //     faces.push(new THREE.Face3(j*resolution+1, (j+1)*resolution, (j+1)*resolution+resolution));

    // }

    // 下端面
    for(let i=1;i<resolution;i++){
        faces.push(new THREE.Face3(height*resolution+1, (height-1)*resolution+i+1, (height-1)*resolution+i))
    }
    faces.push(new THREE.Face3(height*resolution+1,(height-1)*resolution+1, (height)*resolution))
    
    geom = new THREE.Geometry();
    geom.vertices = vertices;
    geom.faces = faces;
    geom.computeFaceNormals();//计算法向量，会对光照产生影响

    //两个材质放在一起使用
    //创建多材质对象，要引入SceneUtils.js文件，如果只有一个材质就不需要这个函数
    mesh = THREE.SceneUtils.createMultiMaterialObject(geom, materials1);
    mesh.children.forEach(function (e) {
        e.castShadow = true
    });
    mesh.receiveShadow = true;
    return mesh;
}