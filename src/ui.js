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
        'node-00000000': { 'nodeID': '00000000', 'name': 'Bath Room', 'url': 'images/00000000/1-5.jpeg' },
        'node-00000001': { 'nodeID': '00000001', 'name': 'Living Room', 'url': 'images/00000001/1-5.jpeg' },
        'node-00000002': { 'nodeID': '00000002', 'name': 'Dining Room', 'url': 'images/00000002/1-5.jpeg' },
        'node-00000003': { 'nodeID': '00000003', 'name': 'Kitchen', 'url': 'images/00000003/1-5.jpeg' }
    });
    TOPPANO.createWaterdrop('waterdrop-00000000-00000002', {
        'fromNodeId': '00000000',
        'toNodeId': '00000002',
        'lng': 150,
        'lat': 50
    });
    setInterval(function() {
        TOPPANO.rotateCompass(TOPPANO.gv.cam.lng);
    }, rotateInterval);
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
        TOPPANO.ui.modelState.addObjProp(id, prop);
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

    $('#node-gallery .swiper-slide img').on('mousedown', function(){console.log("slide is mouse down");$('#container').css('cursor', 'url(images/pin.png), auto');});
    $('#node-gallery .swiper-slide img').on('mouseup', 
                                           function(){ 
                                                var cursor_css = $("#container").css('cursor').toString();
                                                if (cursor_css.search('pin.png')){
                                                    $('#container').css('cursor', 'default');}
                                           });

    $('#container').on('mouseup', function(){
                                                console.log("slide is mouse up");
                                                var cursor_css = $("#container").css('cursor').toString();
                                                if (cursor_css.search('pin.png')){
                                                    $('#container').css('cursor', 'pointer');
                                                }
                                            });
    
    $('#node-gallery .swiper-slide .ui-icon-delete').on('click', TOPPANO.onNGDeleteBtnClick);
    $('#node-gallery .swiper-slide .ui-icon-edit').on('click', TOPPANO.onNGEditBtnClick);
    $('#node-gallery .swiper-slide input[type=text]').on('focusout', TOPPANO.onNGNameInputFocusout);
    $('#node-gallery .swiper-slide input[type=text]').on('keypress', TOPPANO.onNGNameInputKeypress);
    $.each(nodes, function(id, prop) {
        $('#' + id +' img').on('click', function(event) {
            TOPPANO.onNGThumbnailClick(event, prop['nodeID']);
        });
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

    $('#' + id + ' .ui-icon-delete').on('click', function(event) {
        TOPPANO.onWDDeleteBtnClick(event, id);
    });
    $('#' + id + ' .ui-icon-action').on('click', function(event) {
        TOPPANO.onWDGotoBtnClick(event, prop['toNodeId']);
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

