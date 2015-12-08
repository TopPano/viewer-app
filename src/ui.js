// The enter function for creating all ui components.
TOPPANO.createUI = function() {
    TOPPANO.createContactInfo();
};

// Create a component for showing contact information of the model.
TOPPANO.createContactInfo = function() {
    $('#contact-info-main').collapsible({
        iconpos: 'right',
        collapsedIcon: 'arrow-d',
        expandedIcon: 'arrow-u',
        corners: false
    });

    $('#contact-info-main .ui-collapsible-heading-toggle').on('click', TOPPANO.onCIMainClick);
    $('#contact-info-btn').on('click', TOPPANO.onCIBtnClick);
};

// Global ui variables initialization.
TOPPANO.ui = {
    contactUI: {
        animateDelay: 1500
    }
};

