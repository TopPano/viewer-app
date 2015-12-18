// The enter function for creating all ui components.
TOPPANO.createUI = function() {
    var rotateInterval = Math.round(1000 / TOPPANO.ui.compassUI.frames);

    TOPPANO.initFB();
    TOPPANO.createContactInfo();
    TOPPANO.createFullscreenBtn()
    TOPPANO.createCompassBtn();
    TOPPANO.createFBShareBtn();
    TOPPANO.createNodeGallery();
    setInterval(function() {
        TOPPANO.rotateCompass(TOPPANO.gv.cam.lng);
    }, rotateInterval);
};

// Create a component for showing contact information of the model.
TOPPANO.createContactInfo = function() {
    $('#contact-info-main .ui-collapsible-heading-toggle').on('click', TOPPANO.onCIMainClick);
    $('#contact-info-btn').on('click', TOPPANO.onCIBtnClick);
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
    // Contact Information block paramters
    contactUI: {
        animateDelay: 1500
    },
    // Compass Button parameters
    compassUI: {
        frames: 60
    }
};

