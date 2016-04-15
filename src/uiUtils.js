TOPPANO.ui.utils = TOPPANO.ui.utils || {
    openDialog: function(options) {
        if(!options.callbacks) {
            options.callbacks = {};
        }
        options.callbacks.close = $.proxy(function() {
            this.showUI();
        }, this);
        this.hideUI();
        $.magnificPopup.open(options);
    },

    closeDialog: function() {
        $.magnificPopup.instance.close();
    },

    toggleUI: function() {
        $('#logo-bar').toggleClass('ui-hidden');
        $('#menu').toggleClass('ui-hidden');
    },

    showUI: function() {
        console.log('show')
        $('#logo-bar').removeClass('ui-hidden');
        $('#menu').removeClass('ui-hidden');
    },

    hideUI: function() {
        console.log('hide');
        $('#logo-bar').addClass('ui-hidden');
        $('#menu').addClass('ui-hidden');
    }
}

