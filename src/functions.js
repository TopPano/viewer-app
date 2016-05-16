/**
 * Toppano Panorama Viewer API
 * Panorama Function
 */

TOPPANO.modelInit = function(modelId) {
    TOPPANO.gv.modelId = modelId;
    var model = {};
    var url = (TOPPANO.gv.apiUrl + '/posts/' + modelId);

    $.get(url).then(
        function(modelMeta) {
            model['summary'] = {
                'name': modelMeta['name'],
                'presentedBy': modelMeta['presentedBy'],
                'description': modelMeta['description'],
                'address': modelMeta['address']
            };

            TOPPANO.gv.nodes_meta = $.extend({}, modelMeta.nodes);
            // load all imgs and build the first scene 
            TOPPANO.loadAllImg(TOPPANO.gv.nodes_meta)
                 .pipe(function(){
                     var first_node_ID = Object.keys(TOPPANO.gv.nodes_meta)[0];
                     TOPPANO.gv.current_node_ID = first_node_ID;
                     TOPPANO.buildScene(first_node_ID);
                     TOPPANO.readInitCamParams();
                 });
    }).done(function() {
        // add listener
        TOPPANO.addListener();
    });

}

TOPPANO.threeInit = function(map) {
    TOPPANO.initGV(map);

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
    var texture = THREE.ImageUtils.loadTexture(file_url, THREE.UVMapping, function() {
      texture.minFilter = THREE.LinearFilter;
      var file_obj = {"name":file_name, "texture":texture};
      if(!('textures' in TOPPANO.gv.nodes_meta[node_ID])){
        TOPPANO.gv.nodes_meta[node_ID]['textures'] = new Array();
      }
      TOPPANO.gv.nodes_meta[node_ID].textures.push(file_obj);
      return _dfr.resolve("success load "+file_name);
    }, function() {
      return _dfr.reject("fail load "+LinearFilter_name);
    });
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
                                       /* increase progress bar */
                                       var current_progress = $('#progress-div progress').val();
                                       $('#progress-div progress').val(current_progress+10); 
                                   }));
            }
        }
    }

    $.when.apply($, deferreds).then(
            function(){
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
             function() {
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
    opacity = 1;

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
    TOPPANO.handleClick();
    window.addEventListener('resize', TOPPANO.onWindowResize, false);
};

// setting global variables for initialization
TOPPANO.initGV = function(para){
    if (para.zoom) {
        TOPPANO.gv.cam.defaultCamFOV = clamp(para.zoom, TOPPANO.gv.para.fov.min, TOPPANO.gv.para.fov.max);
    }
    if (para.canvas) {
        TOPPANO.gv.canvasID = para.canvas;
    }
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
  requestAnimationFrame(TOPPANO.update);
  TOPPANO.gv.renderer.clear();
  TOPPANO.gv.renderer.render(TOPPANO.gv.scene, TOPPANO.gv.cam.camera);
  TOPPANO.gv.renderer.clearDepth();
  TOPPANO.gv.renderer.render(TOPPANO.gv.objScene, TOPPANO.gv.cam.camera);
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
    
    // mainly for changing TOPPANO.gv.cam.camera.fov
    TOPPANO.gv.cam.camera.updateProjectionMatrix();

    TOPPANO.renderScene();
    TOPPANO.updateCurrentUrl();
};

TOPPANO.updateCurrentUrl = function() {
    var queryStr = 
        'post=' + TOPPANO.gv.modelId +
        '&fov=' + parseInt(TOPPANO.gv.cam.camera.fov) +
        '&lat=' + parseInt(TOPPANO.gv.cam.lat) +
        '&lng=' + parseInt(TOPPANO.gv.cam.lng);
    TOPPANO.gv.currentUrl = window.location.origin + '/?' + base64Convert(queryStr, 'encode');
};

function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
}

// Get a URL parameter's value by name.
function getUrlParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var queryStr = location.search.substr(1),
        regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results;
    if(queryStr.indexOf('post=') > -1) {
        // Query string contains 'post=', it means query string is not encoded with base64.
        results = regex.exec('?' + queryStr);
    } else {
        // Query string is encoded with base64, decode it.
        results = regex.exec('?' + base64Convert(queryStr, 'decode'));
    }
    return results === null ? "" : decodeURIComponent(results[1]);
    //return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Encode/Decode string with base64.
function base64Convert(str64, action) {
    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
    if(action === 'encode') {
        return Base64.encode(str64);
    } else {
        return Base64.decode(str64);
    }
}

