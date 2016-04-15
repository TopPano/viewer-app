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

    isDialogOpened: function() {
        return $.magnificPopup.instance.isOpen;
    },

    toggleUI: function() {
        $('#logo-bar').toggleClass('ui-hidden');
        $('#menu').toggleClass('ui-hidden');
    },

    showUI: function() {
        $('#logo-bar').removeClass('ui-hidden');
        $('#menu').removeClass('ui-hidden');
    },

    hideUI: function() {
        $('#logo-bar').addClass('ui-hidden');
        $('#menu').addClass('ui-hidden');
    }
}

