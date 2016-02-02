// The enter function for creating all ui components.
TOPPANO.createUI = function(model) {
    TOPPANO.createMenu(model['menu']);
    TOPPANO.createSummary(model['summary']);
    TOPPANO.createFullscreenBtn()
    TOPPANO.createFBShareBtn();
    TOPPANO.createEmbeddedLink();
};

// Create a sidebar menu.
TOPPANO.createMenu = function(menu) {
    TOPPANO.initFB();
    TOPPANO.initTwitter();
    $('#menu .sidebar-content-info-message').html(menu['info']['message']);
    $('#menu .sidebar-btn').on('click', TOPPANO.onMenuBtnClick);
    $('#menu .sidebar-icon').on('click', TOPPANO.onMenuIconClick);
    $('#menu .sidebar-content-share-width').on('input', TOPPANO.onEmbeddedLinkChange);
    $('#menu .sidebar-content-share-height').on('input', TOPPANO.onEmbeddedLinkChange);
    TOPPANO.onEmbeddedLinkChange();
};

// Create a component for showing summary of the model.
TOPPANO.createSummary = function(summary) {
    var id = 'summary';

    TOPPANO.createSummaryUI(id);
    TOPPANO.fillSummaryContent(id, summary);
    TOPPANO.addSummaryListener(id, summary);
};

// Create the UI of Summary.
TOPPANO.createSummaryUI = function(id) {
};

// Fill the content of Summary.
TOPPANO.fillSummaryContent = function(id, prop) {
    $.each(prop, function(input, value) {
        $('#' + id + '-' + input).val(value);
    });
};

// Add Listeners of Summary.
TOPPANO.addSummaryListener = function(id, prop) {
    $('#summary-main .ui-collapsible-heading-toggle').on('click', TOPPANO.onSummaryMainClick);
    $('#summary-btn').on('click', TOPPANO.onSummaryBtnClick);
};

// Create a button for enter/exit fullscreen mode.
TOPPANO.createFullscreenBtn = function() {
    $('#fullscreen-btn').on('click', TOPPANO.onFullscreenBtnClick);
};

// Create a Facebook share button.
TOPPANO.createFBShareBtn = function() {
    $('#fb-share-btn').on('click', TOPPANO.onFBShareBtnClick);
};

// Create a block for sharing embedded link.
TOPPANO.createEmbeddedLink = function() {
    /*
    TOPPANO.onEmbeddedLinkChange();
    $('#embedded-link-width').on('input', TOPPANO.onEmbeddedLinkChange);
    $('#embedded-link-height').on('input', TOPPANO.onEmbeddedLinkChange);
    */
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
    // Summary block paramters
    summaryUI: {
        animateDelay: 1500
    },
    // Facebook SDK parameters
    fbSdkParams: {
        appId: '226223091041998',
        version: 'v2.5'
    },
    // Google API parameters
    googleApiParams: {
        shortUrlKey: 'AIzaSyDh1jky-M2BSe5Dnq2CdZiqadfB7t0Qan4'
    },
    // Embedded Link parameters
    /*
    embeddedLinkUI: {
        minWidth: 240,
        minHeight: 160
    }
    */
};

