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

