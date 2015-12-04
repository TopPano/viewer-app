TOPPANO.createUI = function() {
    TOPPANO.createContactInfo();
};

TOPPANO.createContactInfo = function() {
    $('#contact-info .ui-collapsible-heading-toggle').on('click', function(e) { 
        var current = $(this).closest('.ui-collapsible');             
        if (current.hasClass('ui-collapsible-collapsed')) {
            $('.ui-collapsible-content', current).slideDown(150);
        } else {
            $('.ui-collapsible-content', current).slideUp(150);
        }
    });
};

