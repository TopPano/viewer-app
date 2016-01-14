// Listener for clicking Summary button.
TOPPANO.onSummaryBtnClick = function(event) {
    var summaryBtn = $('#summary-btn');
    var summaryMain = $('#summary-main');

    // When the main block is about to be closed, we should collapse
    // the main block if it is expanded.
    if(summaryBtn.hasClass('ui-icon-arrow-r') && !summaryMain.hasClass('ui-collapsible-collapsed')) {
        $('#summary-main .ui-collapsible-heading-toggle').trigger('click');
        summaryMain.delay(TOPPANO.ui.summaryUI.animateDelay);
    }
    summaryMain.animate({width: 'toggle' }, TOPPANO.ui.summaryUI.animateDelay, function() {
        summaryBtn.toggleClass('ui-icon-arrow-r');
        summaryBtn.toggleClass('ui-icon-arrow-l');
    });
};

// Listener for clicking Summary head block.
TOPPANO.onSummaryMainClick = function(event) {
    $('.ui-collapsible-content', $('#summary-main')).slideToggle(TOPPANO.ui.summaryUI.animateDelay);
};

// Listener for value of a Summary input changes.
TOPPANO.onSummaryInputChange = function(event, input) {
    var prop = {};

    prop[input] = $('#summary-' + input).val();
    TOPPANO.ui.modelState.modifyState(
        'summary',
        'summary',
        TOPPANO.ui.modelState.Action.UPDATE,
        prop
    );
};

// Listener for clicking fullscreen button.
TOPPANO.onFullscreenBtnClick = function(event) {
    if($.fullscreen.isFullScreen()) {
        $.fullscreen.exit();
    } else {
        $('body').fullscreen();
    }
};

// Listener for clicking compass button.
TOPPANO.onCompassBtnClick = function(event) {
    $('#compass-btn').prop('disabled', true);
    if(TOPPANO.gv.cam.lng < 180) {
        var intervalID = setInterval(function() {
            TOPPANO.gv.cam.lng = TOPPANO.gv.cam.lng > 1 ? TOPPANO.gv.cam.lng - 1 : 0;
            if(TOPPANO.gv.cam.lng == 0) {
                clearInterval(intervalID);
                $('#compass-btn').prop('disabled', false);
            }
        }, 1);
    } else {
        var intervalID = setInterval(function() {
            TOPPANO.gv.cam.lng = TOPPANO.gv.cam.lng < 359 ? TOPPANO.gv.cam.lng + 1 : 0;
            if(TOPPANO.gv.cam.lng == 0) {
                clearInterval(intervalID);
                $('#compass-btn').prop('disabled', false);
            }
        }, 1);
    }
};

// Listener for clicking Facebook sharing button.
TOPPANO.onFBShareBtnClick = function(event) {
    FB.ui({
        appId: '226223091041998',
        method: 'feed',
        display: 'popup',
        link: 'https://www.google.com',
        name: 'Jellyfish',
        picture: 'https://i.imgur.com/PAdAP3F.jpg',
        description: 'The most beautiful jellyfish!'
    }, function(response){
        // Show message when posting is completed.
        if(response && response.post_id) {
            var resultDialog = $('#fb-share-result-dialog').popup('open');
            setTimeout(function() {
                // Check whether it is closed by user before we close it.
                if(resultDialog.parent().hasClass('ui-popup-active')) {
                    resultDialog.popup('close');
                }
            }, 2000);
        }
    });
};

// Listener for clicking a Node Gallery thumbnail.
TOPPANO.onNGThumbnailClick = function(event, nodeId) {
    // Check whether the current node ID equals to target node ID.
    if(TOPPANO.gv.scene1.panoID !== nodeId) {
        TOPPANO.transitNode(nodeId);
    }
};

// Listener for clicking a Node Gallery delete button.
TOPPANO.onNGDeleteBtnClick = function(event, nodeHtmlId) {
    $('#' + nodeHtmlId).remove();
    // TODO: Also delete the related waterdrops.
    TOPPANO.ui.nodeGalleryUI.swiper.update(true);
    TOPPANO.ui.modelState.modifyState(
        nodeHtmlId,
        'node',
        TOPPANO.ui.modelState.Action.DELETE
    )
};

// Listener for clicking a Node Gallery edit button.
TOPPANO.onNGEditBtnClick = function(event, nodeId) {
    var tagInput = $('input[type=text]', '#node-' + nodeId);
    // Opera sometimes sees return character as 2 characters,
    // so we should multiply by 2 to ensure the cursor
    // always ends up in the end.
    var len = tagInput.val().length * 2;
    var waterdrops = TOPPANO.ui.modelState.getObjPropList('waterdrop');

    TOPPANO.ui.nodeGalleryUI.currentEditTagInputs = [];
    $.each(waterdrops, function(id, prop) {
        if(prop['toNodeId'] === nodeId) {
            TOPPANO.ui.nodeGalleryUI.currentEditTagInputs.push(id);
        }
    });
    tagInput.textinput('enable').focus();
    tagInput[0].setSelectionRange(len, len);
};

// Listener when a Node Gallery tag input loses focus.
TOPPANO.onNGTagInputFocusout = function(event) {
    $(this).textinput('disable');
};

// Listener for keyboard pressing up on a Node Gallery tag input.
TOPPANO.onNGTagInputKeyup= function(event, nodeHtmlId) {
    // Detect pressing up Enter key.
    if(event.which == 13) {
        $('input[type=text]', '#' + nodeHtmlId).textinput('disable');
    }
};

// Listener for a Node Gallery tag input changes.
TOPPANO.onNGTagInputChange= function(event, nodeHtmlId) {
    var nodeTag = $('input[type=text]', '#' + nodeHtmlId).val();

    $.each(TOPPANO.ui.nodeGalleryUI.currentEditTagInputs, function(index, id) {
        $('#' + id + ' input[type=text]').val(nodeTag);
    });
    TOPPANO.ui.modelState.modifyState(
        nodeHtmlId,
        'node',
        TOPPANO.ui.modelState.Action.UPDATE,
        { 'tag': nodeTag }
    );
};

// Listener when mouse hovering in a waterdrop
TOPPANO.onWaterdropHoverIn = function(event, toNodeHtmlId) {
    $('#node-gallery .swiper-slide').each(function(index, slide) {
        if(slide.id === toNodeHtmlId) {
            TOPPANO.ui.nodeGalleryUI.swiper.slideTo(index);
            return false;
        }
    });

    $('#' + toNodeHtmlId).addClass('waterdrop-hover');
};

// Listener when mouse hovering out a waterdrop
TOPPANO.onWaterdropHoverOut = function(event, toNodeHtmlId) {
    $('#' + toNodeHtmlId).removeClass('waterdrop-hover');
};

// Listener for clicking a waterdrop delete button.
TOPPANO.onWDDeleteBtnClick = function(event, waterdropHtmlId) {
    var toNodeId = TOPPANO.ui.modelState.getObjProp(waterdropHtmlId)['toNodeId'];
    var currentNodeId = TOPPANO.gv.scene1.panoID;
    var transitions = TOPPANO.ui.modelState.getObjProp('node-' + currentNodeId)['transitions'];

    $('#' + waterdropHtmlId).trigger('mouseleave').remove();
    $('#node-' + toNodeId).removeClass('has-waterdrop');
    TOPPANO.ui.modelState.delObjProp(waterdropHtmlId);
    for(var index = 0;index < transitions.length;index++) {
        if(transitions[index] === toNodeId) {
            transitions.splice(index, 1);
            break;
        }
    }
};

// Listener for clicking a waterdrop goto button.
TOPPANO.onWDGotoBtnClick = function(event, nodeId) {
    $(event.target).parent().trigger('mouseleave');
    TOPPANO.transitNode(nodeId);
};

TOPPANO.onSGImgClick = function(prop){
    TOPPANO.changeView(prop.nodeId, prop.lng, prop.lat, prop.fov);
};


// Listener for clicking the snapshot gallery switch button.
TOPPANO.onSGSwitchClick = function(event) {
    $(this).toggleClass('ui-icon-arrow-r').toggleClass('ui-icon-arrow-l');
    $('#snapshot-gallery').toggleClass('snapshot-gallery-closed')
            .toggleClass('snapshot-gallery-opened')
};

// Listener for clicking the snapshot gallery take-snapshot button.
TOPPANO.onSGSnapshotBtnClick = function(event) {
    var img = TOPPANO.getSnapshot(TOPPANO.ui.snapshotGalleryUI.snapshotWidth,
                                TOPPANO.ui.snapshotGalleryUI.snapshotHeight);

    TOPPANO.ui.snapshotGalleryUI.currentSnapshot = {
        'url': img,
        'width': TOPPANO.ui.snapshotGalleryUI.snapshotWidth,
        'height': TOPPANO.ui.snapshotGalleryUI.snapshotHeight,
        'nodeId': TOPPANO.gv.current_node_ID,
        'fov': TOPPANO.gv.cam.camera.fov,
        'lng': TOPPANO.gv.cam.lng,
        'lat': TOPPANO.gv.cam.lat
    };

    $('#snapshot-dialog input[type=text]').val('');
    $('#snapshot-dialog-confirm').prop('disabled', true);
    // Bind load event to make sure the dialog pops up after image loads completely.
    $('#snapshot-dialog img').attr('src', img).load(function() {
        $('#snapshot-dialog').popup('open');
        $('#snapshot-dialog input[type=text]').focus();
    });
};

// Listener for clicking a Snapshot Gallery delete button.
TOPPANO.onSGDeleteBtnClick = function(event, snapshotHtmlId) {
    TOPPANO.removeSnapshot(snapshotHtmlId);
    TOPPANO.ui.modelState.modifyState(
        snapshotHtmlId,
        'snapshot',
        TOPPANO.ui.modelState.Action.DELETE
    );
};

// Listener for clicking a Snapshot Gallery edit button.
TOPPANO.onSGEditBtnClick = function(event) {
    var nameInput = $('input[type=text]', $(this).parent());
    // Opera sometimes sees return character as 2 characters,
    // so we should multiply by 2 to ensure the cursor
    // always ends up in the end.
    var len = nameInput.val().length * 2;

    nameInput.textinput('enable').focus();
    nameInput[0].setSelectionRange(len, len);
};

// Listener when a Snapshot Gallery name input loses focus.
TOPPANO.onSGNameInputFocusout = function(event) {
    $(this).textinput('disable');
};

// Listener for keyboard pressing up on a Snapshot Gallery name input.
TOPPANO.onSGNameInputKeyup= function(event) {
    // Detect pressing up Enter key.
    if(event.which == 13) {
        $(this).textinput('disable');
    }
};

// Listener for a Snapshot Gallery name input changes.
TOPPANO.onSGNameInputChange= function(event, snapshotHtmlId) {
    var name = $('input[type=text]', '#' + snapshotHtmlId).val();

    TOPPANO.ui.modelState.modifyState(
        snapshotHtmlId,
        'snapshot',
        TOPPANO.ui.modelState.Action.UPDATE,
        { 'name': name }
    );
};

// Listener for clicking the Snapshot Dialog Cancel Button.
TOPPANO.onSDCancelBtnClick = function(event) {
    $('#snapshot-dialog').popup('close');
}

// Listener for clicking the Snapshot Dialog Confirm Button.
TOPPANO.onSDConfirmBtnClick = function(event) {
    var id = 'snapshot-tmp-' + TOPPANO.genTempId();
    var currentSnapshot = TOPPANO.ui.snapshotGalleryUI.currentSnapshot;

    currentSnapshot['name'] = $('#snapshot-dialog input[type=text]').val();
    TOPPANO.createSnapshot(id, currentSnapshot);
    TOPPANO.ui.modelState.modifyState(
        id,
        'snapshot',
        TOPPANO.ui.modelState.Action.CREATE,
        currentSnapshot
    );
    $('#snapshot-dialog').popup('close');
}

// Listener for Snapshot Dialog name input keyup
TOPPANO.onSDInputKeyup = function(event) {
    var confirmBtn = $('#snapshot-dialog-confirm');

    // Check input is empty or not.
    if(!$(this).val()) {
        confirmBtn.prop('disabled', true);
    } else {
        confirmBtn.prop('disabled', false);
        // Pressing Enter key.
        if(event.which == 13) {
            confirmBtn.trigger('click');
        }
    }
};

// Listener for clicking the Main Toolbar save button.
TOPPANO.onMTSaveClick = function(event) {
    TOPPANO.ui.modelState.commit();
};

// Listener for clicking the Main Toolbar cancel button.
TOPPANO.onMTCancelClick = function(event) {
    TOPPANO.ui.modelState.cancel();
};

//  adjust the take-snapshot button position in Snapshot Gallery.
TOPPANO.adjustSnapshotGallery = function(event) {
    var galleryHeight = $('#snapshot-gallery').height();
    var slideHeight = $('#snapshot-gallery .swiper-slide').height();
    var numSlides = TOPPANO.ui.snapshotGalleryUI.swiper.slides.length;
    var slidesHeight = slideHeight * numSlides + 5 * (numSlides - 1);

    if(slidesHeight > galleryHeight) {
        $('#snapshot-gallery .take-snapshot-short')
            .addClass('take-snapshot-empty')
            .removeClass('take-snapshot-short');
        $('#snapshot-gallery .take-snapshot-long').show();
    } else {
        $('#snapshot-gallery .take-snapshot-empty')
            .addClass('take-snapshot-short')
            .removeClass('take-snapshot-empty');
        $('#snapshot-gallery .take-snapshot-long').hide();
    }
}

// Transit current node to another node.
TOPPANO.transitNode = function(targetNodeId, lng, lat, fov) {
    /*
    var currentNodeId = TOPPANO.gv.scene1.panoID;
    var currentTransitions = TOPPANO.ui.modelState.getObjProp('node-' + currentNodeId)['transitions'];
    var targetTransitions = TOPPANO.ui.modelState.getObjProp('node-' + targetNodeId)['transitions'];

    $.each(currentTransitions, function(index, transition) {
        $('#waterdrop-' + currentNodeId + '-' + transition).hide();
        $('#node-' + transition).removeClass('has-waterdrop');
    });
    */
    TOPPANO.changeView(targetNodeId, lng, lat, fov);
    /*
    $.each(targetTransitions, function(index, transition) {
        $('#waterdrop-' + targetNodeId + '-' + transition).show();
        $('#node-' + transition).addClass('has-waterdrop');
    });
    */
};

