// Listener for clicking summary button.
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

// Listener for clicking summary head block.
TOPPANO.onSummaryMainClick = function(event) {
    $('.ui-collapsible-content', $('#summary-main')).slideToggle(TOPPANO.ui.summaryUI.animateDelay);
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
TOPPANO.onNGDeleteBtnClick = function(event) {
    $(this).parent().remove();
};

// Listener for clicking a Node Gallery edit button.
TOPPANO.onNGEditBtnClick = function(event, nodeId) {
    var nameInput = $('input[type=text]', '#node-' + nodeId);
    // Opera sometimes sees return character as 2 characters,
    // so we should multiply by 2 to ensure the cursor
    // always ends up in the end.
    var len = nameInput.val().length * 2;
    var waterdrops = TOPPANO.ui.modelState.getObjPropList('waterdrop');

    TOPPANO.ui.nodeGalleryUI.currentEditNameInputs = [];
    $.each(waterdrops, function(id, prop) {
        if(prop['toNodeId'] === nodeId) {
            TOPPANO.ui.nodeGalleryUI.currentEditNameInputs.push(id);
        }
    });
    nameInput.textinput('enable').focus();
    nameInput[0].setSelectionRange(len, len);
};

// Listener when a Node Gallery name input loses focus.
TOPPANO.onNGNameInputFocusout = function(event) {
    $(this).textinput('disable');
};

// Listener for keyboard pressing up on a Node Gallery name input.
TOPPANO.onNGNameInputKeyup= function(event) {
    var nodeName = $(this).val();

    $.each(TOPPANO.ui.nodeGalleryUI.currentEditNameInputs, function(index, id) {
        $('#' + id + ' input[type=text]').val(nodeName);
    });

    // Detect pressing up Enter key.
    if(event.which == 13) {
        $(this).textinput('disable');
    }
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

// Transit current node to another node.
TOPPANO.transitNode = function(targetNodeId, lng, lat, fov) {
    var currentNodeId = TOPPANO.gv.scene1.panoID;
    var currentTransitions = TOPPANO.ui.modelState.getObjProp('node-' + currentNodeId)['transitions'];
    var targetTransitions = TOPPANO.ui.modelState.getObjProp('node-' + targetNodeId)['transitions'];

    $.each(currentTransitions, function(index, transition) {
        $('#waterdrop-' + currentNodeId + '-' + transition).hide();
        $('#node-' + transition).removeClass('has-waterdrop');
    });
    TOPPANO.changeView(targetNodeId, lng, lat, fov);
    $.each(targetTransitions, function(index, transition) {
        $('#waterdrop-' + targetNodeId + '-' + transition).show();
        $('#node-' + transition).addClass('has-waterdrop');
    });
};

