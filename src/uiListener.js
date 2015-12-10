// Listener for clicking contact info button.
TOPPANO.onCIBtnClick = function(event) {
    var ciBtn = $('#contact-info-btn');
    var ciMain = $('#contact-info-main');

    // When the main block is about to be closed, we should collapse
    // the main block if it is expanded.
    if(ciBtn.hasClass('ui-icon-arrow-r') && !ciMain.hasClass('ui-collapsible-collapsed')) {
        $('#contact-info-main .ui-collapsible-heading-toggle').trigger('click');
        ciMain.delay(TOPPANO.ui.contactUI.animateDelay);
    }
    ciMain.animate({width: 'toggle' }, TOPPANO.ui.contactUI.animateDelay, function() {
        ciBtn.toggleClass('ui-icon-arrow-r');
        ciBtn.toggleClass('ui-icon-arrow-l');
    });
};

// Listener for clicking contact info main block.
TOPPANO.onCIMainClick = function(event) {
    $('.ui-collapsible-content', $('#contact-info-main')).slideToggle(TOPPANO.ui.contactUI.animateDelay);
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

