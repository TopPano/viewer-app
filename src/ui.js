// The enter function for creating all ui components.
TOPPANO.createUI = function(model) {
    TOPPANO.createMenu(model['menu']);
    TOPPANO.createLikeBtn(model['likebtn']);
};

// Create a sidebar menu.
TOPPANO.createMenu = function(menu) {
    TOPPANO.initFB();
    TOPPANO.initTwitter();
    TOPPANO.initQMark();
    $('#menu .sidebar-content-info-message').html(menu['info']['message']);
    $('#menu .sidebar-btn').on('click', TOPPANO.onMenuBtnClick);
    $('#menu .sidebar-icon').on('click', TOPPANO.onMenuIconClick);
    $('#menu .sidebar-content-share-width').on('input', TOPPANO.onEmbeddedLinkChange);
    $('#menu .sidebar-content-share-height').on('input', TOPPANO.onEmbeddedLinkChange);
    TOPPANO.onEmbeddedLinkChange();
};

// Create a like button.
TOPPANO.createLikeBtn = function(likebtn) {
    $('#like-btn .likebtn-count').html(likebtn['likes']);
    $('#like-btn .likebtn-icon').on('click', TOPPANO.onLikeIconClick);
};

// Initialize Facebook SDK.
TOPPANO.initFB = function() {
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
        FB.init({
            appId: TOPPANO.ui.fbSdkParams.appId,
            version: TOPPANO.ui.fbSdkParams.version
        });
        // Enable Facebook share button when sdk is loaded completely.
        $('#menu .sidebar-content-share-facebook').on('click', TOPPANO.onFBShareBtnClick);
    });
};

// Initialize Twitter SDK.
TOPPANO.initTwitter = function() {
    window.twttr = (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
        if (d.getElementById(id)) return t;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);

        t._e = [];
        t.ready = function(f) {
            t._e.push(f);
        };

        return t;
    }(document, "script", "twitter-wjs"));
    $('#menu .sidebar-content-share-twitter').on('click', TOPPANO.onTwitterShareBtnClick);
};


// initial question mark at top right side
TOPPANO.initQMark = function(){
    $('#q_mark_img').on('click', TOPPANO.onQMarkClick);
}

// Global ui variables initialization.
TOPPANO.ui = {
    // variables for Menu
    menuUI: {
        width: {
            'large': 240,
            'small': 210,
            'none': 0,
        },
        linkMinWidth: 240,
        linkMinHeight: 160,
        currentClickedIcon: null
    },
    // Facebook SDK parameters
    fbSdkParams: {
        appId: '226223091041998',
        version: 'v2.5'
    },
    // Google API parameters
    googleApiParams: {
        shortUrlKey: 'AIzaSyDh1jky-M2BSe5Dnq2CdZiqadfB7t0Qan4'
    }
};

