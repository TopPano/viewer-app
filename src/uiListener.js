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

TOPPANO.onSGImgClick = function(prop) {
    TOPPANO.transitNode(prop.nodeId, prop.lng, prop.lat, prop.fov);
};

// Listener for clicking the snapshot gallery switch button.
TOPPANO.onSGSwitchClick = function(event) {
    $(this).toggleClass('ui-icon-arrow-r').toggleClass('ui-icon-arrow-l');
    $('#snapshot-gallery').toggleClass('snapshot-gallery-closed')
            .toggleClass('snapshot-gallery-opened')
};

// Listener for clicking the Main Toolbar save button.
TOPPANO.onMTSaveClick = function(event) {
    TOPPANO.ui.modelState.commit();
};

// Listener for clicking the Main Toolbar cancel button.
TOPPANO.onMTCancelClick = function(event) {
    TOPPANO.ui.modelState.cancel();
};

// Transit current node to another node.
TOPPANO.transitNode = function(targetNodeId, lng, lat, fov) {
    TOPPANO.changeView(targetNodeId, lng, lat, fov);
};

