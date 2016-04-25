/**
 * Toppano Panorama Viewer API
 * Panorama Function
 */

TOPPANO.modelInit = function() {
    var modelId = TOPPANO.gv.modelID = getUrlParam('post');
    var model = {};
    var url = TOPPANO.ui.user.isLogin() ?
        (TOPPANO.gv.apiUrl + '/posts/' + modelId + '?access_token=' + Cookies.get('token')) :
        (TOPPANO.gv.apiUrl + '/posts/' + modelId);

    $.get(url).then(
        function(modelMeta) {
            model['summary'] = {
                'name': modelMeta['name'],
                'presentedBy': modelMeta['presentedBy'],
                'description': modelMeta['description'],
                'address': modelMeta['address']
            };
            model['snapshotList'] = {};
            $.each(modelMeta['snapshotList'], function(index, prop) {
                model['snapshotList']['snapshot-' + prop['sid']] = prop;
            });
            model['menu'] = {
                'info': {
                    'author': modelMeta['ownerInfo']['username'],
                    'date': modelMeta['created'],
                    'authorPicture': modelMeta['ownerInfo']['profilePhotoUrl'],
                    'message': modelMeta['message']
                }
            };
            model['user'] = {
                'likes':{
                    'count':  modelMeta['likes']['count'],
                    'isLiked': modelMeta['likes']['isLiked']
                }
            };

            TOPPANO.gv.nodes_meta = $.extend({}, modelMeta.nodes);
            // load all imgs and build the first scene 
            TOPPANO.loadAllImg(TOPPANO.gv.nodes_meta).pipe(function () {console.log("start build scene!!");}).
                 pipe(function(){
                     var first_node_ID = Object.keys(TOPPANO.gv.nodes_meta)[0];
                     TOPPANO.gv.current_node_ID = first_node_ID;
                     TOPPANO.buildScene(first_node_ID);
                     if (TOPPANO.gv.objects.showObj) {
                        TOPPANO.addWaterDrop(first_node_ID);
                     }
                     TOPPANO.readInitCamParams();
                 });
    }).done(function() {
        // Fill UI contents
        TOPPANO.fillUIContents(model);
        // add listener
        TOPPANO.addListener();
    });

}

TOPPANO.threeInit = function(map) {
    if (map) {
        TOPPANO.initGV(map);
        if (TOPPANO.gv.isState) {
            TOPPANO.gv.stats = initStats();
        }
    } else {
        // virtual cam init
        var url = TOPPANO.readURL();
        if (url) {
            TOPPANO.initGV(url);
        }
    }

    TOPPANO.gv.cam.camera = new THREE.PerspectiveCamera(
        TOPPANO.gv.cam.defaultCamFOV, // field of view (vertical)
        // 80,
        window.innerWidth / window.innerHeight, // aspect ratio
        1, // near plane
        1100 // far plane
    );

    // change position of the cam
    var sphereSize = TOPPANO.gv.para.sphereSize;
    TOPPANO.gv.cam.camera.target = new THREE.Vector3(sphereSize, sphereSize, sphereSize);

    // scene for bg, objScene for transition objects
    TOPPANO.gv.scene = new THREE.Scene();
    TOPPANO.gv.objScene = new THREE.Scene();

    // renderer setting
    TOPPANO.rendererSetting();
    // load tile images
    var isTrans = false;
    
   /* increase progress bar */
   var current_progress = $('#progress-div progress').val();
   $('#progress-div progress').val(current_progress+8);
};

// Optimization function for mobile devices.
TOPPANO.optimizeMobile = function() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        TOPPANO.gv.mobile.isMobile = true;
        //TOPPANO.gyro.isOn = (getUrlParam('gyro') === 'on');

        // Prevent scrolling the entire page.
        $(document).on('touchmove', function(event) {
            event.preventDefault();
        });
    }
};

function loadImg(node_ID, file_url){
    var _dfr = $.Deferred();
      
    var file_name = file_url.substr(file_url.lastIndexOf('/')+1);
    var texture = THREE.ImageUtils.loadTexture(file_url, THREE.UVMapping, 
                                               function(){
                                                    texture.minFilter = THREE.LinearFilter;
                                                    var file_obj = {"name":file_name, "texture":texture};
                                                    if(!('textures' in TOPPANO.gv.nodes_meta[node_ID])){
                                                        TOPPANO.gv.nodes_meta[node_ID]['textures'] = new Array();
                                                    }
                                                    TOPPANO.gv.nodes_meta[node_ID].textures.push(file_obj);
                                                    return _dfr.resolve("success load "+file_name);
                                               },
                                               function(){return _dfr.reject("fail load "+LinearFilter_name);}
                                              );
    return _dfr.promise();
}

// loading tiles images
TOPPANO.loadAllImg = function(nodes_meta) {
    THREE.ImageUtils.crossOrigin = '';
    var _dfr = $.Deferred();
    var deferreds = [];

    for (node_ID in nodes_meta){
        var node_files = nodes_meta[node_ID].files;
        for (file_index in node_files){
            if(file_index.search('equirectangular')>0 && file_index.search('low')<0 ){
                var file_url = node_files[file_index];
                deferreds.push(loadImg(node_ID, file_url)
                               .done(
                                   function(msg){
                                       console.log(msg);
                                       /* increase progress bar */
                                       var current_progress = $('#progress-div progress').val();
                                       $('#progress-div progress').val(current_progress+10); 
                                   }));
            }
        }
    }

    $.when.apply($, deferreds).then(
            function(){
                console.log("all imgs success load");
                
                // order all files of nodes in TOPPANO.gv.file_sets
                for (node_ID in TOPPANO.gv.nodes_meta){
                    TOPPANO.gv.nodes_meta[node_ID].textures.sort(
                    function(a,b){
                        if(a.name>b.name)
                            return 1;
                        else if(a.name<b.name)
                            return -1
                        return 0});
                }
                _dfr.resolve();              
             },
             function(){console.log("imgs fail load");
                         _dfr.reject();              
             }
            );
    return _dfr.promise();
};

TOPPANO.buildScene = function(node_ID){
    var sphereSize = TOPPANO.gv.para.sphereSize;
    var node_textures = TOPPANO.gv.nodes_meta[node_ID].textures;
    var i;
    var opacity;
    
    TOPPANO.gv.headingOffset = 0;
    if(TOPPANO.gv.isTransitioning){
        opacity = 0;
    }
    else{
        opacity = 1;
    }

    for(i=0; i<8; i++){
        var j = parseInt(i/4);
        var geometry = new THREE.SphereGeometry(sphereSize, 20, 20, Math.PI/2 * i - TOPPANO.gv.headingOffset * Math.PI / 180, Math.PI/2, Math.PI/2 * j, Math.PI/2);
        geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

        var material = new THREE.MeshBasicMaterial({
            map:node_textures[i].texture,
            overdraw: true,
            transparent: true,
            opacity: opacity
        });
        var mesh = new THREE.Mesh(geometry, material);
        TOPPANO.gv.scene.add(mesh);
    }
}

// Read the initial camera parameters from url query string.
TOPPANO.readInitCamParams = function() {
    var fov = parseInt(getUrlParam('fov')),
        lat = parseInt(getUrlParam('lat'));
        lng = parseInt(getUrlParam('lng'));

    if(!isNaN(fov)) {
        TOPPANO.gv.cam.camera.fov = Math.max(TOPPANO.gv.para.fov.min, Math.min(TOPPANO.gv.para.fov.max, fov));
    }
    if(!isNaN(lat)) {
        TOPPANO.gv.cam.lat = Math.max(-85, Math.min(85, lat));
    }
    if(!isNaN(lng)) {
        TOPPANO.gv.cam.lng = (lng + 360) % 360;
    }
};

// add listeners
TOPPANO.addListener = function() {
    TOPPANO.setCursorHandler();
    document.addEventListener('dragover', function(event) {
        TOPPANO.onDocumentDragOver(event);
    }, false);
    document.addEventListener('dragenter', TOPPANO.onDocumentDragEnter, false);
    document.addEventListener('dragleave', TOPPANO.onDocumentDragLeave, false);
    document.addEventListener('drop', function(event) {
        TOPPANO.onDocumentDrop(event);
    }, false);
    window.addEventListener('resize', TOPPANO.onWindowResize, false);
};

// reading URL info
TOPPANO.readURL = function() {
    var url = TOPPANO.gv.urlHash;
    if (url) {
        var urlSlice = url.slice(1, url.length).split(',');
        // console.log(urlSlice);
        if (urlSlice.length === 4) {
            return {
                zoom: clamp(parseInt(urlSlice[0]), TOPPANO.gv.para.fov.min, TOPPANO.gv.para.fov.max),
                center: {
                    lat: parseInt(urlSlice[1]),
                    lng: parseInt(urlSlice[2])
                },
                PanoID: urlSlice[3]
            }
        }
    }
};

// setting global variables for initialization
TOPPANO.initGV = function(para){
    if (para.zoom) {
        TOPPANO.gv.cam.defaultCamFOV = clamp(para.zoom, TOPPANO.gv.para.fov.min, TOPPANO.gv.para.fov.max);
    }
    if (para.canvas) {
        TOPPANO.gv.canvasID = para.canvas;
    }
    if (para.isfbShare) {
        TOPPANO.gv.isFBShare = true;
    }
    if (para.isState) {
        TOPPANO.gv.isState = true;
    }
    if (para.showObj === false) {
        TOPPANO.gv.objects.showObj = para.showObj;
    }
};

// loading tiles images
TOPPANO.loadTiles = function(isTrans, ID) {
    var sphereSize = TOPPANO.gv.para.sphereSize;
    THREE.ImageUtils.crossOrigin = '';

    for (var i = 0 ; i < 4 ; i++) {
        for (var j = 0 ; j < 8 ; j++) {
            var geometry = new THREE.SphereGeometry(sphereSize, 20, 20, Math.PI/4 * j, Math.PI/4, Math.PI/4 * i, Math.PI/4);
            if (isTrans) {
                TOPPANO.gv.para.sphereSize -= 1;
                geometry = new THREE.SphereGeometry(TOPPANO.gv.para.sphereSize, 4, 8, Math.PI/4 * j - TOPPANO.gv.headingOffset * Math.PI / 180, Math.PI/4, Math.PI/4 * i, Math.PI/4);
            }
            geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

            var imagePath = TOPPANO.gv.tilePath + ID +'/' + i + '-' + j + '.jpeg',
                texture = THREE.ImageUtils.loadTexture(imagePath);
                texture.minFilter = THREE.LinearFilter;

                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    overdraw: true,
                    transparent: true
                });
                if (isTrans) {
                    material.opacity = 0;
                }
                var mesh = new THREE.Mesh(geometry, material);
                TOPPANO.gv.scene.add(mesh);
        }
    }
    if (isTrans) {
        sleep(500);
    }
    //console.log(TOPPANO.gv.scene.children.length);  // 32
};

// jump to another scene
TOPPANO.change2Scene = function(panoID) {
    TOPPANO.loadTiles(false, panoID);
    for (var i = 31 ; i >= 0 ; i--) {
        TOPPANO.gv.scene.remove(TOPPANO.gv.scene.children[i]);
    }
};

// snapshot canvas drawing initialization
TOPPANO.snapshotCanvasInit = function() {
    TOPPANO.drawCanvas();
    var canvas = document.getElementById('myCanvas');
    hide(canvas);
};

// transfer to another scene
TOPPANO.changeScene = function(next_node_ID) {
    // delete all waterdrops html obj in current scene
    TOPPANO.gv.objects.waterdropObj.forEach(
        function(element, array, index){
            $('#'+element.id).remove();
        });
    //clear TOPPANO.gv.objects.waterdropObj    
    TOPPANO.gv.objects.waterdropObj.splice(0, TOPPANO.gv.objects.waterdropObj.length);
    TOPPANO.gv.current_node_ID = next_node_ID;

    TOPPANO.gv.isTransitioning = true;
    TOPPANO.buildScene(next_node_ID);
    TOPPANO.addWaterDrop(next_node_ID);
};

// it's a cooperation function for Su Jia-Kuan
// it's a copy of TOPPANO.changeScene()
TOPPANO.changeView = function(node_ID, lng, lat, fov) {
    // delete all waterdrops html obj in current scene
    if (node_ID != TOPPANO.gv.current_node_ID){
        TOPPANO.gv.objects.waterdropObj.forEach(
            function(element, array, index){
                $('#'+element.id).remove();
            });
        //clear TOPPANO.gv.objects.waterdropObj    
        TOPPANO.gv.objects.waterdropObj.splice(0, TOPPANO.gv.objects.waterdropObj.length);
        TOPPANO.gv.current_node_ID = node_ID;
    
        TOPPANO.gv.isTransitioning = true;
        TOPPANO.buildScene(node_ID);
        TOPPANO.addWaterDrop(node_ID);
    }
    if(lng)
    {TOPPANO.gv.cam.lng = lng;}

    if(lat)
    {TOPPANO.gv.cam.lat = lat;}
    
    if(fov)
    {TOPPANO.gv.cam.camera.fov = fov;}
    TOPPANO.update();
};


function latlng_to_dimen3(lat, lng){
    var phi = THREE.Math.degToRad(90 - lat),
        theta = THREE.Math.degToRad(lng);

    var radius = 1000;
    var x = radius * Math.sin(phi) * Math.cos(theta),
        y = radius * Math.cos(phi),
        z = radius * Math.sin(phi) * Math.sin(theta);
    return {'x':x, 'y':y, 'z':z};
}


TOPPANO.addWaterDrop = function(node_ID){
    var node_meta = TOPPANO.gv.nodes_meta[node_ID];
    if(node_meta.transitions)
    {   
        node_meta.transitions.forEach(
            function(transition, index, array)
            {
                // clone a waterdrop html obj                                                          
                // push the waterdrop element in waterdropObj[]
                var waterdrop = $("#waterdrop-0").clone();
                var nextNodeTag = TOPPANO.gv.nodes_meta[transition.nextNodeId].tag;
                $('input[type=text]', waterdrop).val(nextNodeTag);
                waterdrop.css({position:'absolute', display:'block'});
                var id = 'waterdrop-'+TOPPANO.gv.current_node_ID+'-to-'+transition.nextNodeId;
                waterdrop.attr('id', id);

                waterdrop.on('click', function(event){
                    TOPPANO.changeScene(transition.nextNodeId);
                })

                $('#container').append(waterdrop);
                var waterdrop_obj = {"id": id, "obj": waterdrop, 
                                     "position_3D": latlng_to_dimen3(transition.lat, transition.lng), 
                                     "next_node_ID":transition.nextNodeId, 
                                     "current_node_ID":TOPPANO.gv.current_node_ID};  
                TOPPANO.gv.objects.waterdropObj.push(waterdrop_obj);
            });
    }
}


// add plane for testing GLSL
TOPPANO.addPlane = function() {
    // console.log('Add transition objects here.');
    var radiusObj = TOPPANO.gv.objects.objSphereRadius,
        phiObj = THREE.Math.degToRad(90),
            thetaObj = THREE.Math.degToRad(0);

            var uniforms = {
                "color1" : {
                    type : "c",
                    value : new THREE.Color(0xffffff)
                },
                "color2" : {
                    type : "c",
                    value : new THREE.Color(0x7CC5D7)
                },
                "radius1" : {
                    type : "f",
                    value : 0.3,
                    min : 0, // only used for dat.gui, not needed for production
                    max : 1 // only used for dat.gui, not needed for production
                },
                "radius2" : {
                    type : "f",
                    value : 0.32,
                    min : 0, // only used for dat.gui, not needed for production
                    max : 1 // only used for dat.gui, not needed for production
                },
                "amount" : {
                    type : "f",
                    value : 80,
                    min : 1, // only used for dat.gui, not needed for production
                    max : 100 // only used for dat.gui, not needed for production
                },
            }
            var vertexShader = document.getElementById('vertexShader').text;
            var fragmentShader = document.getElementById('fragmentShader').text;

            var materialObj = new THREE.ShaderMaterial({
                uniforms : uniforms,
                vertexShader : vertexShader,
                fragmentShader : fragmentShader
            });

            var geometryObj = new THREE.PlaneBufferGeometry(200, 140, 32),
                // materialObj = new THREE.MeshBasicMaterial({
                // 	color: 0x000000,
                // 	side: THREE.DoubleSide,
                // 	opacity: 0.7,
                // 	transparent: true
                // }),
                transitionObj = new THREE.Mesh(geometryObj, materialObj);

                var xObj = radiusObj * Math.sin(phiObj) * Math.cos(thetaObj),
                    yObj = radiusObj * Math.cos(phiObj),
                        zObj = radiusObj * Math.sin(phiObj) * Math.sin(thetaObj);
                        transitionObj.position.set(xObj, yObj, zObj);
                        transitionObj.lookAt(TOPPANO.gv.cam.camera.position);
                        TOPPANO.gv.objScene.add(transitionObj);
};

// renderer setting
TOPPANO.rendererSetting = function() {
    // WebGLRenderer for better quality if having webgl
    var webglRendererPara = {
        preserveDrawingBuffer: true,
        autoClearColor: false,
        alpha: true
    };
    TOPPANO.gv.renderer = new THREE.WebGLRenderer(webglRendererPara);
//    : new THREE.CanvasRenderer(); // with no WebGL supported
    TOPPANO.gv.renderer.setClearColor( 0x000000, 0 );

    TOPPANO.gv.renderer.sortObjects = false;
    TOPPANO.gv.renderer.autoClear = false;
    TOPPANO.gv.renderer.setPixelRatio(window.devicePixelRatio);
    var container = document.getElementById(TOPPANO.gv.canvasID);
    var canvasHeight = window.getComputedStyle(document.getElementById(TOPPANO.gv.canvasID), null).getPropertyValue('height'),
    canvasWidth = window.getComputedStyle(document.getElementById(TOPPANO.gv.canvasID), null).getPropertyValue('width');
    canvasHeight = parseInt(canvasHeight, 10),
    canvasWidth = parseInt(canvasWidth, 10);

    if (canvasWidth * canvasHeight > 0) {
        TOPPANO.gv.renderer.setSize(canvasWidth, canvasHeight);
    }
    else {
        TOPPANO.gv.isFullScreen = true;
        TOPPANO.gv.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    container.appendChild(TOPPANO.gv.renderer.domElement);
    // set some global variables about container styles
    var bodyRect = document.body.getBoundingClientRect(),
        containerRect = container.getBoundingClientRect();
        TOPPANO.gv.container.offsetTop = containerRect.top - bodyRect.top,
        TOPPANO.gv.container.offsetLeft = containerRect.left - bodyRect.left,
        TOPPANO.gv.container.Height = containerRect.bottom - containerRect.top,
        TOPPANO.gv.container.Width = containerRect.right - containerRect.left;
        TOPPANO.gv.container.bound.top = TOPPANO.gv.container.offsetTop,
        TOPPANO.gv.container.bound.bottom = TOPPANO.gv.container.offsetTop + TOPPANO.gv.container.Height,
        TOPPANO.gv.container.bound.left = TOPPANO.gv.container.offsetLeft,
        TOPPANO.gv.container.bound.right = TOPPANO.gv.container.offsetLeft + TOPPANO.gv.container.Width;
};

// if hit the objects(and the objects are visible), return: (isHit, hitObj)
TOPPANO.hitSomething = function(event, targetObjs) {
    if (TOPPANO.gv.isFullScreen) {
        var mouse3D = new THREE.Vector3(((event.clientX - TOPPANO.gv.container.offsetLeft) / window.innerWidth) * 2 - 1, //x
                                        -((event.clientY - TOPPANO.gv.container.offsetTop) / window.innerHeight) * 2 + 1, //y
                                        0.5); // z
    }
    else {
        var canvasHeight = window.getComputedStyle(document.getElementById(TOPPANO.gv.canvasID), null).getPropertyValue('height'),
            canvasWidth = window.getComputedStyle(document.getElementById(TOPPANO.gv.canvasID), null).getPropertyValue('width');
            canvasHeight = parseInt(canvasHeight, 10),
                canvasWidth = parseInt(canvasWidth, 10);
                var mouse3D = new THREE.Vector3(((event.clientX - TOPPANO.gv.container.offsetLeft) / canvasWidth) * 2 - 1, //x
                                                -((event.clientY - TOPPANO.gv.container.offsetTop) / canvasHeight) * 2 + 1, //y
                                                0.5); // z
    }

    mouse3D.unproject(TOPPANO.gv.cam.camera);
    mouse3D.sub(TOPPANO.gv.cam.camera.position);
    mouse3D.normalize();
    var raycaster = new THREE.Raycaster(TOPPANO.gv.cam.camera.position, mouse3D);
    var intersects = raycaster.intersectObjects(targetObjs);
    if (intersects.length > 0) {
        // return which object is hit
        for (var i = 0; i < targetObjs.length; i++) {
            if (intersects[0].object.position.distanceTo(targetObjs[i].position) < 10) {
                return [true, targetObjs[i]];
            }
        }
    } else
        return [false, null];
};

// if hit the objects(and the objects are visible), return: (isHit, hitObj)
TOPPANO.hitSphere = function(event) {
    // event.clientY
    var mouse2D = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, //x
                                    -(event.clientY / window.innerHeight) * 2 + 1); // y

                                    var raycaster = new THREE.Raycaster();
                                    raycaster.setFromCamera(mouse2D, TOPPANO.gv.cam.camera);
                                    var intersects = raycaster.intersectObjects(TOPPANO.gv.scene.children);
                                    // console.log(intersects[0].point);
                                    return intersects[0].point;
};


// snapshot function
TOPPANO.getSnapshot = function(width, height) {
    var canvasMini = $('<canvas width="' + width + '" height="' + height + '"></canvas>')
            .attr('type', 'hidden').append('#container');
    var snapshot = '';

    canvasMini[0].getContext('2d').drawImage(TOPPANO.gv.renderer.domElement, 0, 0, width, height);
    snapshot= canvasMini[0].toDataURL('image/jpeg', 0.8);
    canvasMini.remove();

    return snapshot;
};

// render scene
TOPPANO.renderScene = function() {
    if (TOPPANO.gv.isTransitioning) {
        var fadeInSpeed = 0.01;
        // if second scene fully shows up
        if (TOPPANO.gv.scene.children[12].material.opacity >= 1) {
            TOPPANO.gv.isTransitioning = false;
            for (var i = 7 ; i >= 0 ; i--) {
                TOPPANO.gv.scene.remove(TOPPANO.gv.scene.children[i]);
            }
            TOPPANO.gv.objects.transitionObj = [];
            //TOPPANO.addTransition();
            requestAnimationFrame(TOPPANO.update);
            return 0;
        }

        // fade in animation
        for (var i = 15 ; i >= 8 ; i--) {
            TOPPANO.gv.scene.children[i].material.opacity += fadeInSpeed;
        }
        requestAnimationFrame(TOPPANO.renderScene);
        TOPPANO.gv.renderer.clear();
        TOPPANO.gv.renderer.render(TOPPANO.gv.scene, TOPPANO.gv.cam.camera);
        TOPPANO.gv.renderer.clearDepth();
        TOPPANO.gv.renderer.render(TOPPANO.gv.objScene, TOPPANO.gv.cam.camera);
    } else {
        //first load
        requestAnimationFrame(TOPPANO.update);
        TOPPANO.gv.renderer.clear();
        TOPPANO.gv.renderer.render(TOPPANO.gv.scene, TOPPANO.gv.cam.camera);
        TOPPANO.gv.renderer.clearDepth();
        TOPPANO.gv.renderer.render(TOPPANO.gv.objScene, TOPPANO.gv.cam.camera);
    }
};

// threejs update
TOPPANO.update = function() {
    TOPPANO.gv.cam.lat = Math.max(-85, Math.min(85, TOPPANO.gv.cam.lat));
    TOPPANO.gv.cam.lng = (TOPPANO.gv.cam.lng + 360) % 360;
    TOPPANO.gv.cam.phi = THREE.Math.degToRad(90 - TOPPANO.gv.cam.lat);
    TOPPANO.gv.cam.theta = THREE.Math.degToRad(TOPPANO.gv.cam.lng);

    // y: up
    TOPPANO.gv.cam.camera.target.x = Math.sin(TOPPANO.gv.cam.phi) * Math.cos(TOPPANO.gv.cam.theta);
    TOPPANO.gv.cam.camera.target.y = Math.cos(TOPPANO.gv.cam.phi);
    TOPPANO.gv.cam.camera.target.z = Math.sin(TOPPANO.gv.cam.phi) * Math.sin(TOPPANO.gv.cam.theta);
    TOPPANO.gv.cam.camera.lookAt(TOPPANO.gv.cam.camera.target);
    
   
    var vect_target_onXZ = new THREE.Vector3(TOPPANO.gv.cam.camera.target.x, 0, TOPPANO.gv.cam.camera.target.z); 
    var vect_cam_up = new THREE.Vector3(0, 1, 0);
    var normal_vect = new THREE.Vector3();
    normal_vect.crossVectors(vect_target_onXZ, vect_cam_up);
    normal_vect = normal_vect.normalize();
    vect_cam_up.applyAxisAngle(normal_vect, (Math.PI/180)*(TOPPANO.gv.cam.lat));
    

    vect_cam_up.applyAxisAngle(TOPPANO.gv.cam.camera.target, (Math.PI/180)*TOPPANO.gyro.screen_rot_angle);
    TOPPANO.gv.cam.camera.up.x = vect_cam_up.x;
    TOPPANO.gv.cam.camera.up.y = vect_cam_up.y;
    TOPPANO.gv.cam.camera.up.z = vect_cam_up.z;
    
    if (TOPPANO.gv.isState) {
        TOPPANO.gv.stats.update();
    }

    // mainly for changing TOPPANO.gv.cam.camera.fov
    TOPPANO.gv.cam.camera.updateProjectionMatrix();

    // if the cursor is rotating rotating the sphere (actually is rotating the camera)
    // update the waterdrop's style in its' html tag
    // if TOPPANO.gv.cursor.state == "holding-swiper.. or waterdrop", do not update
    
    // whenever holding-waterdrop, the position of each waterdrop will be update.
    // so do not modify the waterdrop css position
    
    if(TOPPANO.gv.cursor.state != "holding-waterdrop"){
    TOPPANO.gv.objects.waterdropObj.forEach(
                            function(element, index, array)
                            {
                                var position_3D = new THREE.Vector3(element.position_3D.x, element.position_3D.y, element.position_3D.z );
                                position_3D.project(TOPPANO.gv.cam.camera);
                                var x = (position_3D.x+1)*window.innerWidth/2;
                                var y = -(position_3D.y-1)*window.innerHeight/2;
                                if(position_3D.z<1){
                                    element.obj.css({"left":x-35, "top":y-30, "display":"block"});
                                }
                                else{element.obj.css({"display":"none"});}
                            });
    }

    TOPPANO.renderScene();
    TOPPANO.updateCurrentUrl();
};

TOPPANO.updateCurrentUrl = function() {
    var queryStr = 
        'post=' + TOPPANO.gv.modelID +
        '&fov=' + parseInt(TOPPANO.gv.cam.camera.fov) +
        '&lat=' + parseInt(TOPPANO.gv.cam.lat) +
        '&lng=' + parseInt(TOPPANO.gv.cam.lng);
    TOPPANO.gv.currentUrl = window.location.origin + '/?' + base64Convert(queryStr, 'encode');
    TOPPANO.onEmbeddedLinkChange();
};

// print out ERROR messages
TOPPANO.printError = function (errorMsg) {
    console.log('Error: ' + errorMsg);
};

function preventDefaultBrowser(event) {
    // Chrome / Opera / Firefox
    if (event.preventDefault)
        event.preventDefault();
    // IE 9
    event.returnValue = false;
}

// js performance monitor
function initStats() {
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    return stats;
}

// return: phi(lat:the angle between x-z plane, have to subtract 90) and theta(lng)
function xyz2LatLng(x, y ,z) {
    // y: up, phi: the angle between y axis, theta: the angle between x asix on x-z plane
    var r = Math.sqrt(x*x + y*y + z*z),
        theta = Math.atan(z / x),
            phi = Math.acos(y / r);
            var cosTheta = x / r / Math.sin(phi);
            if (cosTheta < 0)
                theta += Math.PI;
            var thetaDegree = theta * 180 / Math.PI,
                phiDegree = phi * 180 / Math.PI

                var objLatLng = new TOPPANO.LatLng(90 - phiDegree, thetaDegree);
                return objLatLng;
}

function between(num, min, max) {
    return num >= min && num <= max;
}

function isEmpty(str) {
    return (!str || 0 === str.length || /^\s*$/.test(str));
}

function sleep(ms) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > ms) {
            break;
        }
    }
}

function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
}

// Get a URL parameter's value by name.
function getUrlParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec('?' + base64Convert(location.search.substr(1), 'decode'));
    return results === null ? "" : decodeURIComponent(results[1]);
    //return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function base64Convert(str64, action) {
    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
    if(action === 'encode') {
        return Base64.encode(str64);
    } else {
        return Base64.decode(str64);
    }
}

