/**
 * Toppano Panorama Viewer API
 * Listener Function
 */

// check whether in the container
TOPPANO.checkMouseInContainer = function(event) {
    var mouseX = event.clientX,
        mouseY = event.clientY;
        return between(mouseX, TOPPANO.gv.control.bound.left, TOPPANO.gv.control.bound.right)
        && between(mouseY, TOPPANO.gv.control.bound.top, TOPPANO.gv.control.bound.bottom);
};


TOPPANO.onDocumentMouseDown = function(event) {
    // console.log('MouseDown');

    // check mouse in the container first (if not, isUserInteracting = false by default)
    if (TOPPANO.checkMouseInContainer(event)) {
        TOPPANO.gv.interact.isUserInteracting = true;
    }

    TOPPANO.gv.interact.onPointerDownPointerX = event.clientX;
    TOPPANO.gv.interact.onPointerDownPointerY = event.clientY;

    TOPPANO.gv.interact.onPointerDownLon = TOPPANO.gv.cam.lng;
    TOPPANO.gv.interact.onPointerDownLat = TOPPANO.gv.cam.lat;
};

TOPPANO.onDocumentMouseMove = function(event) {

    if (TOPPANO.gv.interact.isUserInteracting) {
        var deltaX = TOPPANO.gv.interact.onPointerDownPointerX - event.clientX,
            deltaY = event.clientY - TOPPANO.gv.interact.onPointerDownPointerY;

            TOPPANO.gv.cam.lng = deltaX * 0.1 + TOPPANO.gv.interact.onPointerDownLon;
            TOPPANO.gv.cam.lat = deltaY * 0.1 + TOPPANO.gv.interact.onPointerDownLat;
    }

    // check if hover something, change the icon color
    var hit = TOPPANO.hitSomething(event, TOPPANO.gv.objects.transitionObj),
        isHit = hit[0],
            hitObj = hit[1];
            if (isHit) {
                hitObj.material.color.set('orange');
            } else {
                TOPPANO.gv.objects.transitionObj.forEach(function(item) {
                    item.material.color.set('white');
                });
            }
};

TOPPANO.onDocumentMouseUp = function(event) {
    TOPPANO.gv.interact.isUserInteracting = false;

    var hit = TOPPANO.hitSomething(event, TOPPANO.gv.objects.transitionObj),
        isHit = hit[0],
            hitObj = hit[1];
            if (isHit) {
                
                //TOPPANO.gv.scene1.nextInfo = hit[1].name; the code maybe useless
                TOPPANO.changeScene(hitObj);
            }

    /* disable by uniray        
    if (TOPPANO.checkMouseInContainer(event)) {

            // add objects if user wants
            var hitPos = TOPPANO.hitSphere(event);
            
            var ObjLatLng = xyz2LatLng(hitPos.x, hitPos.y, hitPos.z);
            console.log(ObjLatLng.lat, ObjLatLng.lng);
            TOPPANO.addRandObj2(ObjLatLng, 10);
            // TOPPANO.addRandObj(hitPos.x, hitPos.y, hitPos.z, 10);

            // check if hit something, and change the sphere
            TOPPANO.updateURL();
    }
   */
};

TOPPANO.onDocumentMouseWheel = function(event) {
    // check FoV range

    if (TOPPANO.checkMouseInContainer(event)
        && TOPPANO.gv.cam.camera.fov <= TOPPANO.gv.para.fov.max
    && TOPPANO.gv.cam.camera.fov >= TOPPANO.gv.para.fov.min) {
        // WebKit (Safari / Chrome)
        if (event.wheelDeltaY) {
            TOPPANO.gv.cam.camera.fov -= event.wheelDeltaY * 0.05;
        }
        // Opera / IE 9
        else if (event.wheelDelta) {
            TOPPANO.gv.cam.camera.fov -= event.wheelDelta * 0.05;
        }
        // Firefox
        else if (event.detail) {
            TOPPANO.gv.cam.camera.fov += event.detail * 1.0;
        }
    }

    if (TOPPANO.gv.cam.camera.fov > TOPPANO.gv.para.fov.max) {
        TOPPANO.gv.cam.camera.fov = TOPPANO.gv.para.fov.max;
    }
    if (TOPPANO.gv.cam.camera.fov < TOPPANO.gv.para.fov.min) {
        TOPPANO.gv.cam.camera.fov = TOPPANO.gv.para.fov.min;
    }

    // var cameraFov = TOPPANO.gv.cam.camera.fov,
    // cameraAspect = TOPPANO.gv.cam.camera.aspect;
    // var hFOV = 2 * Math.atan( Math.tan( cameraFov * Math.PI / 180 / 2 ) * cameraAspect ) * 180 / Math.PI; // degrees
    // console.log(hFOV);

    TOPPANO.gv.cam.camera.updateProjectionMatrix();

    // update URL after scroll stops for 0.1 second
    if (TOPPANO.gv.interact.timer !== null) {
        clearTimeout(TOPPANO.gv.interact.timer);
    }
    TOPPANO.gv.interact.timer = setTimeout(function() {
        TOPPANO.updateURL();
    }, 50);
};



TOPPANO.onDocumentTouchStart = function(event) {
    // console.log('TouchStart');
    console.log("TouchStart event.clientX = ",event.touches[0].clientX);
    console.log("TouchStart event.clientY = ",event.touches[0].clientY);
    TOPPANO.gv.interact.onPointerDownPointerX = event.touches[0].clientX;
    TOPPANO.gv.interact.onPointerDownPointerY = event.touches[0].clientY;
    TOPPANO.gv.interact.onPointerDownLon = TOPPANO.gv.cam.lng;
    TOPPANO.gv.interact.onPointerDownLat = TOPPANO.gv.cam.lat;
};
TOPPANO.onDocumentTouchMove = function(event) {
    console.log('TouchMove');
    var angle = -TOPPANO.gyro.screen_rot_angle*(Math.PI/180);
    var deltaX = TOPPANO.gv.interact.onPointerDownPointerX - event.touches[0].clientX,
        deltaY = event.touches[0].clientY - TOPPANO.gv.interact.onPointerDownPointerY;
        TOPPANO.gv.cam.lng = (deltaX*(Math.cos(angle)) - deltaY*(Math.sin(angle))) * 0.1 + TOPPANO.gv.interact.onPointerDownLon;
        TOPPANO.gv.cam.lat = (deltaX*(Math.sin(angle)) + deltaY*(Math.cos(angle))) * 0.1 + TOPPANO.gv.interact.onPointerDownLat;
    console.log(TOPPANO.gyro.screen_rot_angle);
        console.log(deltaX);
    console.log("\n\n");
};
TOPPANO.onDocumentTouchEnd = function(event) {
    // console.log('TouchEnd');
    console.log("TouchEnd event.clientX = ",event.changedTouches[0].clientX);
    console.log("TouchEnd event.clientY = ",event.changedTouches[0].clientY);
    var hit = TOPPANO.hitSomething(Math.abs(event.changedTouches[0]), TOPPANO.gv.objects.transitionObj),
        isHit = hit[0],
            hitObj = hit[1];
            if (isHit) {
                TOPPANO.gv.scene1.nextInfo = hit[1].name;
                TOPPANO.changeScene(hitObj);
            }
};


TOPPANO.onDeviceOrientation = function(event){
    var degtorad = Math.PI / 180;

    var x = event.beta*degtorad;
    var y = event.gamma*degtorad;
    var z = event.alpha*degtorad;

    var cX = Math.cos( x );
    var cY = Math.cos( y );
    var cZ = Math.cos( z );
    var sX = Math.sin( x );
    var sY = Math.sin( y );
    var sZ = Math.sin( z );

    // Calculate Vx and Vy components
    var V_heading_negZ = new THREE.Vector3( -cZ*sY -sZ*sX*cY, -sZ*sY + cZ*sX*cY, -cX*cY);
    // Calculate compass heading
    var longitude = Math.atan( V_heading_negZ.x / V_heading_negZ.y );

    var leng_onXY = Math.sqrt(Math.pow(V_heading_negZ.x,2)+Math.pow(V_heading_negZ.y,2)); 
    var latitude = Math.atan(leng_onXY/V_heading_negZ.z); 

    // Convert compass heading to use whole unit circle
    if( V_heading_negZ.y < 0 ) {
        longitude += Math.PI;
    } else if( V_heading_negZ.x < 0 ) {
        longitude += 2 * Math.PI;
    }
    if( V_heading_negZ.z < 0 ) {
        latitude += Math.PI;
    } 

    longitude = longitude * ( 180 / Math.PI ); 
    latitude = ((-1)*latitude+Math.PI/2) * ( 180 / Math.PI ); 
    
    if(TOPPANO.gyro.setup == false)
    {    
        TOPPANO.gv.cam.lng = longitude;
        TOPPANO.gv.cam.lat = latitude;
        TOPPANO.gyro.lng = longitude; 
        TOPPANO.gyro.lat = latitude; 
        TOPPANO.gyro.setup = true; 
    }
    else    
    {
        var lng_delta = longitude-TOPPANO.gyro.lng;
        var lat_delta = latitude-TOPPANO.gyro.lat;
        TOPPANO.gv.cam.lng += lng_delta;
        TOPPANO.gv.cam.lat += lat_delta;
        TOPPANO.gyro.lng = longitude; 
        TOPPANO.gyro.lat = latitude;
    }


    var V_heading_Y = new THREE.Vector3((-1)*cX*sZ, cZ*cX, sX);  
    var V_Z =  new THREE.Vector3(0, 0, 1);
    var V_rot_axis = new THREE.Vector3();
    V_rot_axis.crossVectors(V_heading_negZ, V_Z);
      
    V_rot_axis = V_rot_axis.normalize();
    V_Z.applyAxisAngle(V_rot_axis, (Math.PI/180)*TOPPANO.gv.cam.lat);

    var angle = V_Z.angleTo(V_heading_Y);
    angle = angle*(180/Math.PI);

    var side = V_heading_Y.dot(V_rot_axis) ;
    if(side<0)
    {angle = -angle;}
    
    TOPPANO.gyro.screen_rot_angle = angle;
    console.log(angle);
    console.log(TOPPANO.gyro.screen_rot_angle);
    console.log("\n\n");
    var cam_rot_axis = new THREE.Vector3(Math.cos(TOPPANO.gv.cam.lng*(Math.PI/180)), 0,  Math.sin(TOPPANO.gv.cam.lng*(Math.PI/180)));
    var cam_z_axis = new THREE.Vector3(0, 1, 0);
    cam_z_axis.applyAxisAngle(cam_rot_axis, (Math.PI/180)*(angle));

    TOPPANO.gv.cam.camera.up.x = cam_z_axis.x;
    TOPPANO.gv.cam.camera.up.y = cam_z_axis.y;
    TOPPANO.gv.cam.camera.up.z = cam_z_axis.z;
}

function sleep(milliseconds) {
      var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds){
                          break;
                              }
                                }
}


TOPPANO.onDocumentDragOver = function(event) {
    preventDefaultBrowser(event);
    event.dataTransfer.dropEffect = 'copy';
};

TOPPANO.onDocumentDragEnter = function() {
    document.body.style.opacity = 0.5;
};

TOPPANO.onDocumentDragLeave = function() {
    document.body.style.opacity = 1;
};

TOPPANO.onDocumentDrop = function(event) {
    preventDefaultBrowser(event);

    var reader = new FileReader();
    reader.addEventListener('load', function(event) {
        var fileType = event.target.result.slice(5, 10);

        if (fileType === 'image') {
            TOPPANO.gv.scene1.material.map.image.src = event.target.result;
            TOPPANO.gv.scene1.material.map.needsUpdate = true;
        }
        // filetype === 'video'
    }, false);
    reader.readAsDataURL(event.dataTransfer.files[0]);
    document.body.style.opacity = 1;
};

TOPPANO.onDocumentKeyUp = function(key) {
    var canvas = document.getElementById('myCanvas');

    if (canvas.style.opacity > 0) {
        // press 's': snapshot function
        if (key.which === 83) {
            fadeOut(canvas, 600);
        }
    }
    else{    
        // press 's': snapshot function
        if (key.which === 83) {
            fadeIn(canvas, 600);
            TOPPANO.getSnapshot();
        } 
        else{
            // press 'q': snapshot function (for testing ajax func now.)
            if (key.which === 81) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', 'get?id=456', false);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.send(null);
                if (xhr.status === 200) {
                    // console.log(xhr.responseText);
                    var userInfo = JSON.parse(xhr.responseText);
                    console.log(userInfo);
                }
                else
                    console.log('XMLHttpRequest failed. Status: ' + xhr.status);
            } else

                // press 'p': snapshot save image
                if (key.which === 80) {
                    TOPPANO.change2Scene('00000002');
                }
        }}
};

TOPPANO.onWindowResize = function() {
    if (TOPPANO.gv.isFullScreen) {
        TOPPANO.gv.cam.camera.aspect = window.innerWidth / window.innerHeight;
        TOPPANO.gv.cam.camera.updateProjectionMatrix();
        TOPPANO.gv.renderer.setSize(window.innerWidth, window.innerHeight);

        TOPPANO.gv.container.bound.bottom = window.innerHeight;
        TOPPANO.gv.container.bound.right = window.innerWidth;
        TOPPANO.gv.control.bound.bottom = TOPPANO.gv.container.bound.bottom-$("#node-gallery").height();
        TOPPANO.gv.control.bound.right = TOPPANO.gv.container.bound.right;

        var canvas = document.getElementById('myCanvas');
        if (canvas.style.opacity > 0) {
            TOPPANO.drawCanvas();
        }
    }
};
