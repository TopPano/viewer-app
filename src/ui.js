// The enter function for creating all ui components.
TOPPANO.createUI = function() {
    TOPPANO.createContactInfo();
    TOPPANO.createFullscreenBtn()
};

// Create a component for showing contact information of the model.
TOPPANO.createContactInfo = function() {
    $('#contact-info-main .ui-collapsible-heading-toggle').on('click', TOPPANO.onCIMainClick);
    $('#contact-info-btn').on('click', TOPPANO.onCIBtnClick);
};

// Create a button for enter/exit fullscreen mode
TOPPANO.createFullscreenBtn = function() {
    $('#fullscreen-btn').on('click', TOPPANO.onFullscreenBtnClick);
};

// Global ui variables initialization.
TOPPANO.ui = {
    contactUI: {
        animateDelay: 1500
    }
};

