TOPPANO.ui.likebtn = TOPPANO.ui.likebtn || {
    init: function() {
    },

    getHtml: function() {
        var icon = '<div class="likebtn-icon"></div>';
        var count = '<div class="likebtn-count-wrapper"><div class="likebtn-count"></div></div>';
        //var count = '<div class="likebtn-count"></div>';

        if(TOPPANO.gv.mobile.isMobile) {
            return '<div id="like-btn" class="likebtn">' + count + icon + '</div>';
        } else {
            return '<div id="like-btn" class="likebtn">' + icon + count + '</div>';
        }
    }
};

