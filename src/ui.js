// The enter function for creating all ui components.
TOPPANO.createUI = function() {
    var rotateInterval = Math.round(1000 / TOPPANO.ui.compassUI.frames);

    TOPPANO.ui.modelState = new TOPPANO.ModelState();

    TOPPANO.initFB();
    TOPPANO.createSummary();
    TOPPANO.createFullscreenBtn()
    TOPPANO.createCompassBtn();
    TOPPANO.createFBShareBtn();
    TOPPANO.createNodeGallery();
    TOPPANO.createWaterdrop();
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
TOPPANO.createNodeGallery = function() {
    var swiper = new Swiper('.swiper-container', {
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
    TOPPANO.ui.nodeGallery = swiper;

    $('#node-gallery .swiper-slide img').on('mousedown', function(){console.log("slide is mouse down");$('#container').css('cursor', 'url(images/pin.png), auto');});
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
    // Node Gallery object (Swiper)
    nodeGallery: null,
    modelState: null
};

