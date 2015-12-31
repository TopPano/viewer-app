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
        'node-00000000': {
            'nodeId': '00000000', 'name': 'Bath Room', 'url': 'images/00000000/1-5.jpeg',
            'transitions': ['00000002', '00000003'] },
        'node-00000001': {
            'nodeId': '00000001', 'name': 'Living Room', 'url': 'images/00000001/1-5.jpeg',
            'transitions': ['00000000'] },
        'node-00000002': {
            'nodeId': '00000002', 'name': 'Dining Room', 'url': 'images/00000002/1-5.jpeg',
            'transitions': [] },
        'node-00000003': {
            'nodeId': '00000003', 'name': 'Kitchen', 'url': 'images/00000003/1-5.jpeg',
            'transitions': ['00000002'] }
    });
    TOPPANO.createWaterdrops({
        'waterdrop-00000000-00000002': {
            'fromNodeId': '00000000',
            'toNodeId': '00000002',
            'lng': 150,
            'lat': 50
        },
        'waterdrop-00000000-00000003': {
            'fromNodeId': '00000000',
            'toNodeId': '00000003',
            'lng': 150,
            'lat': 150
        },
        'waterdrop-00000001-00000000': {
            'fromNodeId': '00000001',
            'toNodeId': '00000000',
            'lng': 200,
            'lat': 200
        },
        'waterdrop-00000003-00000002': {
            'fromNodeId': '00000003',
            'toNodeId': '00000002',
            'lng': 250,
            'lat': 200
        }

    });
    TOPPANO.createSnapshotGallery();
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

TOPPANO.createSnapshotGallery = function() {
    var galleryHeight = $(window).height() - $('#node-gallery').height();

    TOPPANO.ui.snapshotGalleryUI.swiper = new Swiper('.swiper-container-snapshot', {
        scrollbar: '.swiper-scrollbar-snapshot',
        nextButton: '.swiper-button-next-snapshot',
        prevButton: '.swiper-button-prev-snapshot',
        direction: 'vertical',
        scrollbarHide: true,
        slidesPerView: 'auto',
        keyboardControl: true,
        mousewheelControl: true,
        speed: 400,
        spaceBetween: 5,
        setWarpperSize: true,
        scrollbarDraggable: true,
        grabCursor: false
    });

    TOPPANO.ui.snapshotGalleryUI.swiper.appendSlide('<div class="swiper-slide take-snapshot"></div>');
    $('#snapshot-gallery .swiper-container').height(galleryHeight);
    $('#snapshot-gallery').height(galleryHeight);

    var slideHeight = $('#snapshot-gallery .swiper-slide').height();
    var numSlides = TOPPANO.ui.snapshotGalleryUI.swiper.slides.length;
    var slidesHeight = slideHeight * numSlides + 5 * (numSlides - 1);
    if(slidesHeight > galleryHeight) {
        $('#snapshot-gallery .take-snapshot').addClass('take-snapshot-empty');
        $('<div class="take-snapshot take-snapshot-fixed"></div>')
            .appendTo('#snapshot-gallery .swiper-container')
            .zIndex($('#snapshot-gallery .take-snapshot').zIndex() + 1);
    }

    $('#snapshot-gallery .swiper-slide .ui-icon-delete').on('click', TOPPANO.onSGDeleteBtnClick);
    $('#snapshot-gallery .swiper-slide .ui-icon-edit').on('click', TOPPANO.onSGEditBtnClick);
    $('#snapshot-gallery .swiper-slide input[type=text]')
            .on('focusout', TOPPANO.onSGNameInputFocusout)
            .on('keyup', TOPPANO.onSGNameInputKeyup);
    $('#snapshot-gallery-switch').on('click', TOPPANO.onSGSwitchClick);

    TOPPANO.ui.snapshotGalleryUI.swiper.update(true);
    TOPPANO.ui.snapshotGalleryUI.swiper.slideTo(0);
    //$('#snapshot-gallery-switch').trigger('click');
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
        TOPPANO.ui.modelState.addObjProp(id, prop);
    });
    $('#node-gallery .swiper-wrapper').append(content);
    $('#node-gallery').enhanceWithin();

    TOPPANO.ui.nodeGalleryUI.swiper = new Swiper('.swiper-container-node', {
        scrollbar: '.swiper-scrollbar-node',
        nextButton: '.swiper-button-next-node',
        prevButton: '.swiper-button-prev-node',
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
    $('#node-gallery .swiper-slide input[type=text]').on('focusout', TOPPANO.onNGNameInputFocusout);
    $('#node-gallery .swiper-slide input[type=text]').on('keyup', TOPPANO.onNGNameInputKeyup);
    $.each(nodes, function(id, prop) {
        $('#' + id +' img').on('click', function(event) {
            TOPPANO.onNGThumbnailClick(event, prop['nodeId']);
        });
        $('#' + id + ' .ui-icon-edit').on('click', function(event) {
            TOPPANO.onNGEditBtnClick(event, prop['nodeId']);
        });
    });
};

TOPPANO.createWaterdrops = function(waterdrops) {
    $.each(waterdrops, function(id, prop) {
        TOPPANO.createWaterdrop(id, prop);
    });
};

TOPPANO.createWaterdrop = function(id, prop) {
    var toNodeHtmlId = 'node-' + prop['toNodeId'];
    var name = TOPPANO.ui.modelState.getObjProp(toNodeHtmlId)['name'];
    var content =
        '<div id="' + id + '" class="waterdrop">' +
        '  <button class="ui-btn ui-icon-action ui-btn-icon-notext"></button>' +
        '  <button class="ui-btn ui-icon-delete ui-btn-icon-notext"></button>' +
        '  <input type="text" data-mini="true" data-corners="false" disabled="disabled" value="' + name + '">' +
        '</div>';

    $(content).appendTo('.ui-page').enhanceWithin().css({
        'top': prop['lng'],
        'left': prop['lat']
    });

    $('#' + id).draggable({
        containment: '#container',
        addClasses: false,
        opacity: 0.75,
        stack: '#node-gallery'
    });

    $('#' + id).hover(function(event) {
        TOPPANO.onWaterdropHoverIn(event, toNodeHtmlId);
    }, function(event) {
        TOPPANO.onWaterdropHoverOut(event, toNodeHtmlId);
    });
    $('#' + id + ' .ui-icon-delete').on('click', function(event) {
        TOPPANO.onWDDeleteBtnClick(event, id);
    });
    $('#' + id + ' .ui-icon-action').on('click', function(event) {
        TOPPANO.onWDGotoBtnClick(event, prop['toNodeId']);
    });

    TOPPANO.ui.modelState.addObjProp(id, prop);
    if(TOPPANO.gv.scene1.panoID == prop['fromNodeId']) {
        $('#' + toNodeHtmlId).addClass('has-waterdrop');
    } else {
        $('#' + id).hide();
    }
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
                                                var waterdrop_obj = {"id": id, "obj": waterdrop, "position_3D": null, "node_ID":event.currentTarget.id.toString()};
                                                TOPPANO.gv.cursor.element = waterdrop_obj;
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
                                                $('#'+TOPPANO.gv.cursor.element.node_ID).animate({ 
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
        swiper: null,
        currentEditNameInputs: []
    },
    // Snapshot Gallery parameters
    snapshotGalleryUI: {
        swiper: null
    },
    modelState: null
};

