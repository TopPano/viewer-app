TOPPANO.ui.help = TOPPANO.ui.help || {
    init: function() {
        $('#help-btn').on('click', function(event) {
            var startWindowScroll = 0;
            $.magnificPopup.open({
                items: {
                    src: '#help-dialog',
                    type: 'inline'
                },
                showCloseBtn: false
            });
        });
        $('#help-dialog').on('click', function(event) {
          $.magnificPopup.instance.close();
        });
    },

    getHtml: function() {
        var html = ' \
            <div id="help-dialog" class="help-dialog mfp-hide"> \
                <div class="help-item"> \
                    <img class="help-item-img" src="./css/images/help-look-$target$.svg" alt="Look Around"> \
                    <div class="help-item-desc">Look Around</div> \
                </div> \
                <div class="help-item"> \
                    <img class="help-item-img" src="./css/images/help-zoom-$target$.svg" alt="Look Around"> \
                    <div class="help-item-desc">Zoom In/Out</div> \
                </div> \
                <div class="help-item"> \
                    <img class="help-item-img" src="./css/images/help-click-$target$.svg" alt="Look Around"> \
                    <div class="help-item-desc">(X1) Hide/Show</div> \
                </div> \
                <div class="help-item"> \
                    <img class="help-item-img" src="./css/images/help-click-$target$.svg" alt="Look Around"> \
                    <div class="help-item-desc">(X2) FullScreen</div> \
                </div> \
            </div>';
        if(TOPPANO.gv.mobile.isMobile) {
            return html.split('$target$').join('mobile');
        } else {
            return html.split('$target$').join('desktop');
        }
    }
};

