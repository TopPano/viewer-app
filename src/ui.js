// The enter function for creating all ui components.
TOPPANO.createUI = function(model) {
    TOPPANO.initFB();
    TOPPANO.createSummary(model['summary']);
    TOPPANO.createFullscreenBtn()
    TOPPANO.createFBShareBtn();
    TOPPANO.createEmbeddedLink();
    TOPPANO.createSnapshotGallery('snapshot-gallery', model['snapshotList']);
};

// Create a component for showing summary of the model.
TOPPANO.createSummary = function(summary) {
    var id = 'summary';

    TOPPANO.createSummaryUI(id);
    TOPPANO.fillSummaryContent(id, summary);
    TOPPANO.addSummaryListener(id, summary);
};

// Create the UI of Summary.
TOPPANO.createSummaryUI = function(id) {
};

// Fill the content of Summary.
TOPPANO.fillSummaryContent = function(id, prop) {
    $.each(prop, function(input, value) {
        $('#' + id + '-' + input).val(value);
    });
};

// Add Listeners of Summary.
TOPPANO.addSummaryListener = function(id, prop) {
    $('#summary-main .ui-collapsible-heading-toggle').on('click', TOPPANO.onSummaryMainClick);
    $('#summary-btn').on('click', TOPPANO.onSummaryBtnClick);
};

// Create a button for enter/exit fullscreen mode.
TOPPANO.createFullscreenBtn = function() {
    $('#fullscreen-btn').on('click', TOPPANO.onFullscreenBtnClick);
};

// Create a Facebook share button.
TOPPANO.createFBShareBtn = function() {
    $('#fb-share-btn').on('click', TOPPANO.onFBShareBtnClick);
};

// Create a block for sharing embedded link.
TOPPANO.createEmbeddedLink = function() {
    TOPPANO.onEmbeddedLinkChange();
    $('#embedded-link-width').on('input', TOPPANO.onEmbeddedLinkChange);
    $('#embedded-link-height').on('input', TOPPANO.onEmbeddedLinkChange);
};

// Create the Snapshot Gallery.
TOPPANO.createSnapshotGallery = function(id, prop) {
    var galleryHeight = $(window).height();

    $('#snapshot-gallery .swiper-container').height(galleryHeight);
    $('#snapshot-gallery').height(galleryHeight);

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
        grabCursor: false,
        resistanceRatio: 0
    });

    $('#snapshot-gallery-switch').on('click', TOPPANO.onSGSwitchClick);

    $.each(prop, function(snapshotId, value) {
        TOPPANO.createSnapshot(snapshotId, value);
    });

    TOPPANO.ui.snapshotGalleryUI.swiper.slideTo(0);
    //$('#snapshot-gallery-switch').trigger('click');
};

// Create a snapshot.
TOPPANO.createSnapshot = function(id, prop) {
    TOPPANO.createSnapshotUI(id);
    TOPPANO.fillSnapshotContent(id, prop);
    TOPPANO.addSnapshotListener(id, prop);
}

// Create the UI of a snapshot.
TOPPANO.createSnapshotUI = function(id) {
    var ui =
        '<div id="' + id + '" class="swiper-slide">' +
        '  <img src=""></img>' +
        '  <input type="text" data-mini="true" data-corners="false" disabled="disabled" value="">' +
        '</div>';
    var swiper = TOPPANO.ui.snapshotGalleryUI.swiper

    swiper.appendSlide(ui);
    $('#snapshot-gallery').enhanceWithin();
    swiper.update(true);
    swiper.slideTo(swiper.slides.length);
};

// Fill the content of a snapshot.
TOPPANO.fillSnapshotContent = function(id, prop) {
    var snapshot = $('#' + id);

    $('img', snapshot).attr('src', prop['url']);
    $('input[type=text]', snapshot).val(prop['name']);
};

// Add listeners of a snapshot.
TOPPANO.addSnapshotListener = function(id, prop) {
    var snapshot = $('#' + id);

    //TODO: it is a fix of wrong fov
    prop.fov = TOPPANO.gv.cam.camera.fov;
    
    $('img', snapshot).on('click', function(){
        TOPPANO.onSGImgClick(prop);
    });
};

// Initialize Facebook SDK.
TOPPANO.initFB = function() {
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
        FB.init({
            appId: TOPPANO.ui.fbSdkParams.appId,
            version: TOPPANO.ui.fbSdkParams.version
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
    // Snapshot Gallery parameters
    snapshotGalleryUI: {
        swiper: null
    },
    // Facebook SDK parameters
    fbSdkParams: {
        appId: '226223091041998',
        version: 'v2.5'
    },
    // Google API parameters
    googleApiParams: {
        shortUrlKey: 'AIzaSyDh1jky-M2BSe5Dnq2CdZiqadfB7t0Qan4'
    },
    // Embedded Link parameters
    embeddedLinkUI: {
        minWidth: 240,
        minHeight: 160
    }
};

