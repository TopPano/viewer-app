/**
 * Toppano Panorama Viewer API
 * Listener Function
 */

function set_WD_Listener(waterdrop_obj){
    waterdrop_obj.obj.on('mousedown',
                    function(event){
                        // whenever the cursor select a waterdrop
                        TOPPANO.gv.cursor.state = "holding-waterdrop";
                        TOPPANO.gv.cursor.element = waterdrop_obj;
                    });
    
  waterdrop_obj.obj.children('.ui-icon-delete').on('click', 
                                             function(){
                                                $(this).parent().remove();
                                                //console.log($(this).parent()[0].id);
                                                //TOPPANO.gv.objects.waterdropObj
                                                // TODO: remove in  TOPPANO.gv.objects.waterdropObj (it's an array)
                                             }); 
}

// 2dimension to 3 dimension (transform the onscreen (x,y) to (x,y,z) on paranorma sphere)
function dimen2_to_dimen3(event){
    var hitPos = TOPPANO.hitSphere(event);
    var ObjLatLng = xyz2LatLng(hitPos.x, hitPos.y, hitPos.z);
    var radiusObj = TOPPANO.gv.objects.objSphereRadius,
        phiObj = THREE.Math.degToRad(90 - ObjLatLng.lat),
        thetaObj = THREE.Math.degToRad(ObjLatLng.lng);
    
    radiusObj = 1000; 
    var xObj = radiusObj * Math.sin(phiObj) * Math.cos(thetaObj),
        yObj = radiusObj * Math.cos(phiObj),
        zObj = radiusObj * Math.sin(phiObj) * Math.sin(thetaObj);
    return {'x':xObj, 'y':yObj, 'z':zObj};
}

function set_on_holding_swiper_slide(){
    // whenever the cursor holding-swiper-slide
    $('#node-gallery div.swiper-slide ').on('mousedown', 
                                            function(event){
                                                if(TOPPANO.gv.cursor.state == "default"){
                                                    TOPPANO.gv.cursor.state = "holding-swiper-slide";
                                                    //var targetName = TOPPANO.ui.modelState.getObjProp(event.currentTarget.id)['tag'];
                                                    var targetName = '';
                                                    var waterdrop = $("#waterdrop-0").clone();
                                                    $('input[type=text]', waterdrop).val(targetName);
                                                    
                                                    var swiper_slide_ID = $(event.currentTarget).attr('id');
                                                    // generate waterdrop id
                                                    var length = TOPPANO.gv.objects.waterdropObj.length;
                                                    // TODO: id generating must be unique
                                                    var current_node_ID = TOPPANO.gv.current_node_ID;
                                                    var next_node_ID = swiper_slide_ID.replace('node-', '');
                                                    
                                                    var id = current_node_ID+'-to-'+next_node_ID+"-"+length.toString();
                                                    waterdrop.id = id;
                                                    $('#container').append(waterdrop);
                                                    var waterdrop_obj = {'current_node_ID': current_node_ID,
                                                                         'id': 'unsaved-'+id, 
                                                                         'next_node_ID': next_node_ID,
                                                                         'obj': waterdrop, 
                                                                         'position_3D': null};
                                                    TOPPANO.gv.cursor.element = waterdrop_obj;
                                                }
                                            });
    $('#container').on('mousemove', 
                       function(event){
                           if(TOPPANO.gv.cursor.state == "holding-swiper-slide")
                            {   
                                var waterdrop = TOPPANO.gv.cursor.element.obj;                           
                                waterdrop.css({top: event.clientY-30, left: event.clientX-35, position:'absolute', display:'block'});
                                // TODO: "y-30" and "x-35" need to be adjust
                            }
                       });
    
    $('#node-gallery div.swiper-slide').on('mousemove', 
                                            function(event){
                                                if(TOPPANO.gv.cursor.state == "holding-swiper-slide")
                                                {
                                                    $('#'+TOPPANO.gv.cursor.element.node_ID).animate({ 
                                                            opacity: 0.5               
                                                    }, 5, function() { });
                                                }
                                            });
    
    $('#node-gallery').on('mouseup',function(){ 
                                                $('#'+TOPPANO.gv.cursor.element.node_ID).animate({ 
                                                            opacity: 1 
                                                    }, 1, function() { });

                                                TOPPANO.gv.cursor.state = "default";
                                                TOPPANO.gv.cursor.element = null; // TODO:TOPPANO.gv.cursor.element must be free
                                           });


    $('#container').on('mouseup', function(event)
                       {
                            if(TOPPANO.gv.cursor.state == "holding-swiper-slide")
                            {       
                                 $('#'+TOPPANO.gv.cursor.element.node_ID).animate({ 
                                            opacity: 1 
                                    }, 1, function() { });
                                // push the waterdrop element in waterdropObj[]
                                var waterdrop_obj = TOPPANO.gv.cursor.element;
                                var waterdrop = waterdrop_obj.obj;
                                waterdrop.attr('id', waterdrop_obj.id);
                                waterdrop_obj.position_3D = dimen2_to_dimen3(event);
                                
                                set_WD_Listener(waterdrop_obj);
                                TOPPANO.gv.objects.waterdropObj.push(waterdrop_obj);
                                TOPPANO.gv.cursor.state = "default";
                                TOPPANO.gv.cursor.element = null;
                            }
                       });
}


function set_on_holding_waterdrop(){
    // for holding-waterdrop
    $('#container').on('mousemove', 
                       function(event){
                           if(TOPPANO.gv.cursor.state == "holding-waterdrop")
                            {
                                var waterdrop = TOPPANO.gv.cursor.element.obj;                           
                                waterdrop.css({top: event.clientY-30, left: event.clientX-35, position:'absolute', display:'block'});
                                // TODO: "y-30" and "x-35" need to be adjust
                            }
                       });
    $('#container').on('mouseup', function(event)
                       {
                            if(TOPPANO.gv.cursor.state == "holding-waterdrop")
                            {   
                                var waterdrop_obj = TOPPANO.gv.cursor.element;
                                waterdrop_obj.position_3D = dimen2_to_dimen3(event);
                                TOPPANO.gv.cursor.state = "default";
                                TOPPANO.gv.cursor.element = null;
                            }
                        });
}


function set_on_rotating_scene(){
    // rotating-scene
    // determine if on the mobile or PC web

    var start_event, move_event, end_event;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) 
    {
        start_event = 'touchstart';
        move_event = 'touchmove';
        end_event = 'touchend';
    }
    else{
        start_event = 'mousedown';
        move_event = 'mousemove';
        end_event = 'mouseup';
    }

    $('#container').on(start_event,
                      function(event){
                          if(TOPPANO.gv.cursor.state == "default"){
                              if(event.type == 'touchstart')
                              {
                                  event.preventDefault();
                                  event = event.originalEvent.touches[0];
                              }
                              TOPPANO.gv.interact.onPointerDownPointerX = event.clientX;
                              TOPPANO.gv.interact.onPointerDownPointerY = event.clientY;
                              TOPPANO.gv.interact.onPointerDownLon = TOPPANO.gv.cam.lng;
                              TOPPANO.gv.interact.onPointerDownLat = TOPPANO.gv.cam.lat;
                              TOPPANO.gv.cursor.position_array.splice(0, TOPPANO.gv.cursor.position_array.length);
                              TOPPANO.gv.cursor.state = 'mouse-down-container';

                              while(TOPPANO.gv.cursor.slide_func_array.length>0){
                                  clearTimeout(TOPPANO.gv.cursor.slide_func_array.shift());
                              }

                          }
                      });

    $('#container').on(move_event, 
                       function(event){
                           if(TOPPANO.gv.cursor.state == "mouse-down-container"){
                                TOPPANO.gv.cursor.state = "rotating-scene";
                            }
                            else if(TOPPANO.gv.cursor.state == "rotating-scene")
                            {
                                if(event.type == 'touchmove')
                                {
                                    event = event.originalEvent.touches[0];
                                    var deltaX = TOPPANO.gv.interact.onPointerDownPointerX - event.clientX,
                                        deltaY = event.clientY - TOPPANO.gv.interact.onPointerDownPointerY;
                                    var angle = -TOPPANO.gyro.screen_rot_angle*(Math.PI/180);
                                    TOPPANO.gv.cam.lng = (deltaX*(Math.cos(angle)) - deltaY*(Math.sin(angle))) * 0.1 + TOPPANO.gv.interact.onPointerDownLon;
                                    TOPPANO.gv.cam.lat = (deltaX*(Math.sin(angle)) + deltaY*(Math.cos(angle))) * 0.1 + TOPPANO.gv.interact.onPointerDownLat;
                                }
                                else{
                                    var deltaX = TOPPANO.gv.interact.onPointerDownPointerX - event.clientX,
                                        deltaY = event.clientY - TOPPANO.gv.interact.onPointerDownPointerY;
                                    TOPPANO.gv.cam.lng = deltaX * 0.1 + TOPPANO.gv.interact.onPointerDownLon;
                                    TOPPANO.gv.cam.lat = deltaY * 0.1 + TOPPANO.gv.interact.onPointerDownLat;
                                }
                                var position = {'clientX': event.clientX, 'clientY': event.clientY};
                                TOPPANO.gv.cursor.position_array.push(position);
                            }
    });
    
    $('#container').on(end_event, 
                       function(event){
                           if(TOPPANO.gv.cursor.state == "rotating-scene"){
                                TOPPANO.gv.cursor.state = "default";
                                TOPPANO.gv.cursor.element = null;
                                if(event.type == 'touchend')
                                {
                                    event = event.originalEvent.changedTouches[0];
                                    var angle = -TOPPANO.gyro.screen_rot_angle*(Math.PI/180);
                                }
                                else{
                                    var angle = 0;
                                }
                                var last_position = TOPPANO.gv.cursor.position_array.pop();
                                    last_sec_position = TOPPANO.gv.cursor.position_array.pop();
                                
                                var deltaX = (last_position.clientX+last_sec_position.clientX)/2 - event.clientX ,
                                    deltaY = event.clientY - (last_position.clientY+last_sec_position.clientY)/2;
                              
                                var count, speed;
                                for (count=0; count<200; count++){    
                                    var id = setTimeout(function(count, id){
                                        TOPPANO.gv.cam.lng += (deltaX*(Math.cos(angle)) - deltaY*(Math.sin(angle))) * (200-count)/10000;
                                        TOPPANO.gv.cam.lat += (deltaX*(Math.sin(angle)) + deltaY*(Math.cos(angle))) * (200-count)/10000;
                                    },(1+count)*5, count, id);
                                    TOPPANO.gv.cursor.slide_func_array.push(id);
                                }
                           }
                       });
}


function set_on_hovering_scene(){
    // hovering-on-scene
    $('#container').on('mousemove', 
                       function(event){
                            if(TOPPANO.gv.cursor.state == "default")
                            {
                                // check if hover something, change the icon color
                                var hit = TOPPANO.hitSomething(event, TOPPANO.gv.objects.transitionObj),
                                    isHit = hit[0],
                                    hitObj = hit[1];
                                if (isHit) {
                                    hitObj.material.color.set('orange');
                                } 
                                else {
                                    TOPPANO.gv.objects.transitionObj.forEach(function(item) {
                                                                                item.material.color.set('white');
                                                                             });
                               }
                            }
    });
}


function set_on_changing_scene(){
    // change scene
    $('#container').on('mouseup', function(event)
                       {
                            if(TOPPANO.gv.cursor.state == "mouse-down-container")
                            {
                                var hit = TOPPANO.hitSomething(event, TOPPANO.gv.objects.transitionObj),
                                    isHit = hit[0],
                                    hitObj = hit[1];
                                if (isHit) {
                                    // TOPPANO.gv.scene1.nextInfo = hit[1].name; the code maybe useless
                                    // TOPPANO.changeScene(hitObj);
                                }
                                TOPPANO.gv.cursor.state = "default";
                                TOPPANO.gv.cursor.element = null;
                            }
                       });

}

function set_on_scrolling_scene(){
    function onMouseWheel(event) {
        // check FoV range
        if (TOPPANO.gv.cam.camera.fov <= TOPPANO.gv.para.fov.max
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

        TOPPANO.gv.cam.camera.updateProjectionMatrix();
        // update URL after scroll stops for 0.1 second
        if (TOPPANO.gv.interact.timer !== null) {
            clearTimeout(TOPPANO.gv.interact.timer);
        }
        TOPPANO.gv.interact.timer = setTimeout(function() {
            TOPPANO.updateURL();
        }, 50);
    };
    
    // for IE & chrome
    $('#container').on('mousewheel', function(event){onMouseWheel(event.originalEvent);});
    // for firefox
    $('#container').on('DOMMouseScroll', function(event){onMouseWheel(event.originalEvent);});
}

TOPPANO.setCursorHandler = function(){
    set_on_holding_swiper_slide();
    set_on_holding_waterdrop();
    set_on_rotating_scene();
    set_on_hovering_scene();
    set_on_changing_scene();
    set_on_scrolling_scene();
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
        TOPPANO.gv.cam.virtual_lat = latitude;
        TOPPANO.gyro.lng = longitude; 
        TOPPANO.gyro.lat = latitude; 
        TOPPANO.gyro.lat = latitude; 
        TOPPANO.gyro.setup = true; 
    }
    else    
    {
        var lng_delta = longitude-TOPPANO.gyro.lng;
        var lat_delta = latitude-TOPPANO.gyro.lat;
        TOPPANO.gv.cam.lng += lng_delta;
        TOPPANO.gv.cam.lat += lat_delta;
        TOPPANO.gv.cam.virtual_lat += lat_delta;
        TOPPANO.gyro.lng = longitude; 
        TOPPANO.gyro.lat = latitude;
    }


    var V_heading_Y = new THREE.Vector3((-1)*cX*sZ, cZ*cX, sX);  
    var V_Z =  new THREE.Vector3(0, 0, 1);
    var V_rot_axis = new THREE.Vector3();
    V_rot_axis.crossVectors(V_heading_negZ, V_Z);
      
    V_rot_axis = V_rot_axis.normalize();
    V_Z.applyAxisAngle(V_rot_axis, (Math.PI/180)*TOPPANO.gv.cam.virtual_lat);
    
    var angle = V_Z.angleTo(V_heading_Y);
    angle = angle*(180/Math.PI);

    var side = V_heading_Y.dot(V_rot_axis) ;
    if(side<0)
    {angle = -angle;}
    
    angle = Math.round(1000*angle)/1000;
    TOPPANO.gyro.screen_rot_angle = angle;
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
   // document.body.style.opacity = 0.5;
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
