// The enter function for creating all ui components.
TOPPANO.createUI = function() {
    var rotateInterval = Math.round(1000 / TOPPANO.ui.compassUI.frames);

    TOPPANO.ui.modelState = new TOPPANO.ModelState();

    TOPPANO.initFB();
    TOPPANO.createSummary();
    TOPPANO.createFullscreenBtn()
    TOPPANO.createCompassBtn();
    TOPPANO.createFBShareBtn();
    TOPPANO.createNodeGallery({
        'node-0': { 'name': 'Bath Room', 'url': 'images/00000000/1-5.jpeg' },
        'node-1': { 'name': 'Living Room', 'url': 'images/00000001/1-5.jpeg' }
    });
    TOPPANO.createWaterdrop();
    setInterval(function() {
        TOPPANO.rotateCompass(TOPPANO.gv.cam.lng);
    }, rotateInterval);

    TOPPANO.setCursorHandler();
};

// Create a component for showing summary of the model.
TOPPANO.createSummary = function() {
    $('#summary-main .ui-collapsible-heading-toggle').on('click', TOPPANO.onSummaryMainClick);
    $('#summary-btn').on('click', TOPPANO.onSummaryBtnClick);
};

// Create a button for enter/exit fullscreen mode.
TOPPANO.createFullscreenBtn = function() {
    $('#fullscreen-btn').on('click', TOPPANO.onFullscreenBtnClick);
};

// Create a compass button for showing current longitude.
TOPPANO.createCompassBtn = function() {
    $('#compass-btn').on('click', TOPPANO.onCompassBtnClick);
};

// Create a Facebook share button.
TOPPANO.createFBShareBtn = function() {
    $('#fb-share-btn').on('click', TOPPANO.onFBShareBtnClick);
};

// Create A node gallery.
TOPPANO.createNodeGallery = function(nodes) {
    var content = '';

    $.each(nodes, function(id, prop) {
        content +=
            '<div id="' + id + '" class="swiper-slide">' +
            '  <img src="' + prop['url'] + '"></img>' +
            '  <input type="text" data-mini="true" data-corners="false" disabled="disabled" value="' + prop['name'] + '">' +
            '  <button class="ui-btn ui-icon-edit ui-btn-icon-notext"></button>' +
            '  <button class="ui-btn ui-icon-delete ui-btn-icon-notext"></button>' +
            '</div>';
    });
    $('#node-gallery .swiper-wrapper').append(content);
    $('#node-gallery').enhanceWithin();

    TOPPANO.ui.nodeGallery = new Swiper('#node-gallery', {
        scrollbar: '.swiper-scrollbar',
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        scrollbarHide: true,
        slidesPerView: 'auto',
        keyboardControl: true,
        mousewheelControl: true,
        speed: 400,
        spaceBetween: 10,
        setWarpperSize: true,
        scrollbarDraggable: true,
        grabCursor: false
    });



    
    $('#node-gallery .swiper-slide .ui-icon-delete').on('click', TOPPANO.onNGDeleteBtnClick);
    $('#node-gallery .swiper-slide .ui-icon-edit').on('click', TOPPANO.onNGEditBtnClick);
    $('#node-gallery .swiper-slide input[type=text]').on('focusout', TOPPANO.onNGNameInputFocusout);
    $('#node-gallery .swiper-slide input[type=text]').on('keypress', TOPPANO.onNGNameInputKeypress);
};

TOPPANO.createWaterdrop = function() {
    $('#waterdrop-0').draggable({
        containment: '#container',
        addClasses: false,
        opacity: 0.75,
        stack: '#node-gallery'
    });

    $('#waterdrop-0 .ui-icon-delete').on('click', TOPPANO.onWDDeleteBtnClick);
};

TOPPANO.setCursorHandler = function(){
    // whenever the cursor select a node
    $('#node-gallery div.swiper-slide ').on('mousedown', 
                                            function(event){
                                                TOPPANO.gv.cursor.state = "holding-swiper-slide";
                                                var waterdrop = $("#waterdrop-0").clone();
                                                waterdrop.css({display:'none'});

                                                // generate waterdrop id
                                                var length = TOPPANO.gv.objects.waterdropObj.length;
                                                // TODO: id generating must be unique
                                                var id = event.currentTarget.id.toString()+"-waterdrop-"+length.toString();

                                                $('#container').append(waterdrop);
                                                var waterdrop_obj = {"id": id, "obj": waterdrop, "position_3D": null};
                                                console.log(waterdrop_obj);
                                                TOPPANO.gv.cursor.element = waterdrop_obj;
                                            });

    $('#node-gallery div.swiper-slide').on('mousemove', 
                                            function(event){
                                                if(TOPPANO.gv.cursor.state == "holding-swiper-slide")
                                                {
                                                    $('#'+TOPPANO.gv.cursor.elementID).animate({ 
                                                            opacity: 0.5               
                                                    }, 5, function() { });
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
                            else if(TOPPANO.gv.cursor.state == "holding-waterdrop")
                            {
                                TOPPANO.gv.interact.isUserInteracting = false; // TODO: it may be a better method
                                var waterdrop = TOPPANO.gv.cursor.element.obj;                           
                                waterdrop.css({top: event.clientY-30, left: event.clientX-35, position:'absolute', display:'block'});
                                // TODO: "y-30" and "x-35" need to be adjust
                            }
                            else if(TOPPANO.gv.cursor.state == "default")
                            {
                            }
    });

    $('#node-gallery').on('mouseup',function(){ 
                                                $('#'+TOPPANO.gv.cursor.elementID).animate({ 
                                                            opacity: 1 
                                                    }, 1, function() { });

                                                TOPPANO.gv.cursor.state = "default";
                                                TOPPANO.gv.cursor.element = null; // TODO:TOPPANO.gv.cursor.element must be free
                                           });

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

    $('#container').on('mouseup', function()
                       {
                                 if(TOPPANO.gv.cursor.state == "holding-swiper-slide")
                            {       
                                 $('#'+TOPPANO.gv.cursor.elementID).animate({ 
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
                            else if(TOPPANO.gv.cursor.state == "holding-waterdrop")
                            {   
                                var waterdrop_obj = TOPPANO.gv.cursor.element;
                                waterdrop_obj.position_3D = dimen2_to_dimen3(event);
                                TOPPANO.gv.cursor.state = "default";
                                TOPPANO.gv.cursor.elementID = null;
                                TOPPANO.gv.cursor.element = null;
                            }
                       });


};



// Control the rotation of compass button.
TOPPANO.rotateCompass = function(degrees) {
    var rotate = 'rotate(' + degrees + 'deg)';

    $('#compass-arrow-btn').css({
        '-webkit-transform' : rotate,
        '-moz-transform' : rotate,
        '-ms-transform' : rotate,
        '-o-transform' : rotate,
        'transform' : rotate
    });
};

// Initialize Facebook SDK.
TOPPANO.initFB = function() {
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
        FB.init({
            appId: '226223091041998',
            version: 'v2.5'
        });
        // Enable Facebook share button when sdk is loaded completely.
        $('#fb-share-btn').removeAttr('disabled');
    });
}

// Global ui variables initialization.
TOPPANO.ui = {
    // Summary block paramters
    summaryUI: {
        animateDelay: 1500
    },
    // Compass Button parameters
    compassUI: {
        frames: 60
    },
    // Node Gallery parameters
    nodeGalleryUI: {
        swiper: null
    },
    modelState: null
};

