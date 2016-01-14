// The enter function for creating all ui components.
TOPPANO.createUI = function(model) {
    var rotateInterval = Math.round(1000 / TOPPANO.ui.compassUI.frames);

    TOPPANO.ui.modelState = new TOPPANO.ModelState();

    TOPPANO.initFB();
    TOPPANO.createSummary(model['summary']);
    TOPPANO.createFullscreenBtn()
    TOPPANO.createCompassBtn();
    TOPPANO.createFBShareBtn();
    TOPPANO.createNodeGallery(model['nodes']);
    /*
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
    */
    TOPPANO.createSnapshotGallery('snapshot-gallery', model['snapshotList']);
    TOPPANO.createToolbarMain();
    setInterval(function() {
        TOPPANO.rotateCompass(TOPPANO.gv.cam.lng);
    }, rotateInterval);
};

// Create a component for showing summary of the model.
TOPPANO.createSummary = function(summary) {
    var id = 'summary';

    TOPPANO.ui.modelState.addObjProp(id, summary);
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
    $.each(prop, function(input, value) {
        $('#' + id + '-' + input).on('input', function(event) {
            TOPPANO.onSummaryInputChange(event, input);
        });
    });
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

// Create the Snapshot Gallery.
TOPPANO.createSnapshotGallery = function(id, prop) {
    var galleryHeight = $(window).height() - $('#node-gallery').height();

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

    TOPPANO.ui.snapshotGalleryUI.swiper
        .appendSlide('<div class="swiper-slide take-snapshot take-snapshot-short"></div>');
    $('<div class="take-snapshot take-snapshot-long"></div>')
        .appendTo('#snapshot-gallery .swiper-container')
        .zIndex($('#snapshot-gallery .take-snapshot.take-snapshot-short').zIndex() + 1);
    TOPPANO.ui.snapshotGalleryUI.swiper.update(true);
    TOPPANO.adjustSnapshotGallery();

    $('#snapshot-gallery-switch').on('click', TOPPANO.onSGSwitchClick);
    $('#snapshot-gallery .take-snapshot').on('click', TOPPANO.onSGSnapshotBtnClick);

    $.each(prop, function(snapshotId, value) {
        TOPPANO.createSnapshot(snapshotId, value);
        TOPPANO.ui.modelState.addObjProp(snapshotId, value);
    });

    TOPPANO.createSnapshotDialog();

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
        '  <button class="ui-btn ui-icon-edit ui-btn-icon-notext"></button>' +
        '  <button class="ui-btn ui-icon-delete ui-btn-icon-notext"></button>' +
        '</div>';
    var swiper = TOPPANO.ui.snapshotGalleryUI.swiper
    var snapshotShort = $('#snapshot-gallery .take-snapshot').not('.take-snapshot-long');

    $(ui).insertBefore(snapshotShort).enhanceWithin();
    swiper.update(true);
    TOPPANO.adjustSnapshotGallery();
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

    $('.ui-icon-delete', snapshot).on('click', function(event) {
        TOPPANO.onSGDeleteBtnClick(event, id);
    });
    $('.ui-icon-edit', snapshot).on('click', TOPPANO.onSGEditBtnClick);
    $('input[type=text]', snapshot)
        .on('focusout', TOPPANO.onSGNameInputFocusout)
        .on('keyup', TOPPANO.onSGNameInputKeyup)
        .on('input', function(event) {
            TOPPANO.onSGNameInputChange(event, id);
        });
    
    //TODO: it is a fix of wrong fov
    prop.fov = TOPPANO.gv.cam.camera.fov;
    
    $('img', snapshot).on('click', function(){
        TOPPANO.onSGImgClick(prop);
    });
};

// Remove a snapshot.
TOPPANO.removeSnapshot = function(id) {
    $('#' + id).remove();
    TOPPANO.ui.snapshotGalleryUI.swiper.update(true);
    TOPPANO.adjustSnapshotGallery();
};

// Reset a new ID of a snapshot.
TOPPANO.resetSnapshotId = function(oldId, newId, prop) {
    // Fire all registed events before adding listeners.
    $('#' + oldId).attr('id', newId).unbind()
        .find('*').unbind();
    TOPPANO.addSnapshotListener(newId, prop);
};

// Create the popup dialog for taking a snapshot.
TOPPANO.createSnapshotDialog = function() {
    $('#snapshot-dialog-cancel').on('click', TOPPANO.onSDCancelBtnClick);
    $('#snapshot-dialog input[type=text]').on('keyup', TOPPANO.onSDInputKeyup);
    $('#snapshot-dialog-confirm').on('click', TOPPANO.onSDConfirmBtnClick);
}

// Create the Node Gallery.
TOPPANO.createNodeGallery = function(nodes) {
    $.each(nodes, function(id, prop) {
        TOPPANO.createNode(id, prop);
        TOPPANO.ui.modelState.addObjProp(id, prop);
    });

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
};

// Create a Node.
TOPPANO.createNode = function(id, prop) {
    TOPPANO.createNodeUI(id);
    TOPPANO.fillNodeContent(id, prop);
    TOPPANO.addNodeListener(id, prop);
};

// Create the UI of a Node.
TOPPANO.createNodeUI = function(id) {
    var ui =
        '<div id="' + id + '" class="swiper-slide">' +
        '  <img src=""></img>' +
        '  <input type="text" data-mini="true" data-corners="false" disabled="disabled" value="">' +
        '  <button class="ui-btn ui-icon-edit ui-btn-icon-notext"></button>' +
        '  <button class="ui-btn ui-icon-delete ui-btn-icon-notext"></button>' +
        '</div>';
    $('#node-gallery .swiper-wrapper').append(ui);
    $('#node-gallery').enhanceWithin();
};

// Fill the content of a Node.
TOPPANO.fillNodeContent = function(id, prop) {
    $('#' + id + ' img').attr('src', prop['thumbnailUrl']);
    $('#' + id + ' input[type=text]').val(prop['tag']);
};

// Add listeners of a Node.
TOPPANO.addNodeListener = function(id, prop) {
    $('#' + id +' img').on('click', function(event) {
        TOPPANO.onNGThumbnailClick(event, prop['sid']);
    });
    $('#' + id + ' .ui-icon-edit').on('click', function(event) {
        TOPPANO.onNGEditBtnClick(event, prop['sid']);
    });
    $('#' + id + ' .ui-icon-delete').on('click', function(event) {
        TOPPANO.onNGDeleteBtnClick(event, id);
    });
    $('#' + id + ' input[type=text]').on('keyup', function(event) {
        TOPPANO.onNGTagInputKeyup(event, id);
    }).on('input', function(event) {
        TOPPANO.onNGTagInputChange(event, id);
    }).on('focusout', TOPPANO.onNGTagInputFocusout);
};

TOPPANO.createWaterdrops = function(waterdrops) {
    $.each(waterdrops, function(id, prop) {
        TOPPANO.createWaterdrop(id, prop);
    });
};

TOPPANO.createWaterdrop = function(id, prop) {
    var toNodeHtmlId = 'node-' + prop['toNodeId'];
    var tag = TOPPANO.ui.modelState.getObjProp(toNodeHtmlId)['tag'];
    var content =
        '<div id="' + id + '" class="waterdrop">' +
        '  <button class="ui-btn ui-icon-action ui-btn-icon-notext"></button>' +
        '  <button class="ui-btn ui-icon-delete ui-btn-icon-notext"></button>' +
        '  <input type="text" data-mini="true" data-corners="false" disabled="disabled" value="' + tag + '">' +
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

// Create the main toolbar which contains save, cancel and mode switching buttons.
TOPPANO.createToolbarMain = function() {
    $('#toolbar-main-save').on('click', TOPPANO.onMTSaveClick);
    $('#toolbar-main-cancel').on('click', TOPPANO.onMTCancelClick);
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

// Gnerate a temporary ID for a dynamically created object that is not synchronized with API server yet.
TOPPANO.genTempId = function() {
    return TOPPANO.ui.tmpId++;
};

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
        currentEditTagInputs: []
    },
    // Snapshot Gallery parameters
    snapshotGalleryUI: {
        swiper: null,
        currentSnapshot: {},
        snapshotWidth: 120,
        snapshotHeight: 80
    },
    tmpId: 0,
    modelState: null
};

