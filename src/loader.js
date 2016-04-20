TOPPANO.ui.loader = TOPPANO.ui.loader || {
    init: function() {
    },

    getHtml: function() {
        return ' \
            <div id="loader" class="loader mfp-hide"> \
                <img src="css/images/loader/loader.svg" alt="Loading.."> \
            </div>';
    },

    open: function() {
        TOPPANO.ui.utils.openDialog({
            items: {
                src: '#loader',
                type: 'inline'
            },
            showCloseBtn: false,
            modal: true // Users is unable to dismiss manually.
        });
    },

    close: function() {
        TOPPANO.ui.utils.closeDialog();
    }
}

