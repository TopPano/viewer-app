/**
 * Toppano Panorama Viewer API
 * Listener Function
 */

function set_on_rotating_scene(){
    // rotating-scene
    // determine if on the mobile or PC web

    var start_event, move_event, end_event;
    if (TOPPANO.gv.mobile.isMobile)
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
                                        TOPPANO.gv.cam.lng += (deltaX) * (200-count)/10000;
                                        TOPPANO.gv.cam.lat += deltaY * (200-count)/10000;
                                    },(1+count)*5, count, id);
                                    TOPPANO.gv.cursor.slide_func_array.push(id);
                                }
                           }
                       });


    $('#container').on('mouseout', 
                       function(){
                            TOPPANO.gv.cursor.state = "default";
                            TOPPANO.gv.cursor.element = null;
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
    };
    
    // for IE & chrome
    $('#container').on('mousewheel', function(event){onMouseWheel(event.originalEvent);});
    // for firefox
    $('#container').on('DOMMouseScroll', function(event){onMouseWheel(event.originalEvent);});
}

TOPPANO.setCursorHandler = function(){
    set_on_rotating_scene();
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
    TOPPANO.gyro.screen_rot_angle = angle + window.orientation;
}

// Handle Click for showing/hiding UI (single), or fullscreen (double).
TOPPANO.handleClick = function() {
    var click = TOPPANO.gv.click;
    var startEvent, endEvent;

    if(TOPPANO.gv.mobile.isMobile) {
        startEvent = 'touchstart';
        endEvent = 'touchend';
    } else {
        startEvent = 'mousedown';
        endEvent = 'mouseup';
    }

    $('#container').on(startEvent, function(e) {
        click.lastMouseDown = new Date().getTime();
        if(TOPPANO.gv.mobile.isMobile) {
            click.startPos.x = e.originalEvent.touches[0].pageX;
            click.startPos.y = e.originalEvent.touches[0].pageY;
        } else {
            click.startPos.x = e.offsetX;
            click.startPos.y = e.offsetY;
        }
    }).on(endEvent, function(e) {
        var deltaX, deltaY;
        if(TOPPANO.gv.mobile.isMobile) {
            click.endPos.x = e.originalEvent.changedTouches[0].pageX;
            click.endPos.y = e.originalEvent.changedTouches[0].pageY;
        } else {
            click.endPos.x = e.offsetX;
            click.endPos.y = e.offsetY;
        }
        deltaX = Math.abs(click.endPos.x - click.startPos.x);
        deltaY = Math.abs(click.endPos.y - click.startPos.y);

        // Check the click duration is small enough and no move occurs while clicking.
        if((new Date().getTime() < (click.lastMouseDown + click.longClickDelay)) && (deltaX < 1) && (deltaY < 1)) {
            click.count++;
            if(click.count === 1) {
                click.timer = setTimeout(function() {
                    // Single click: show/hide all UI.
                    //TOPPANO.ui.utils.toggleUI();
                    click.count = 0;
                }, click.dblclickDelay);
            } else {
                // Double click: turn on/off fullscreen.
                // TODO: Fullscreen support for IOS Safari, Android Browser...
                if(screenfull.enabled) {
                    screenfull.toggle();
                } else {
                    if($.fullscreen.isFullScreen()) {
                        $.fullscreen.exit();
                    } else {
                        $('body').fullscreen();
                    }
                }
                clearTimeout(click.timer);
                click.count = 0;
            }
        }
    });
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
    }
};
