// The enter function for creating all ui components.
TOPPANO.createUI = function(model) {
    TOPPANO.createMenu(model.menu);
    TOPPANO.ui.user.init(model.user);
    TOPPANO.addContainerEvent();
};

// Create a sidebar menu.
TOPPANO.createMenu = function(menu) {
    TOPPANO.initCommon();
    TOPPANO.initFB();
    TOPPANO.initTwitter();
    TOPPANO.initQMark();
    $('#menu .sidebar-content-info-message').val(menu['info']['message']);
    $('#menu .sidebar-icon').on('click', TOPPANO.onMenuIconClick);
    $('#menu .sidebar-content-share-width').on('input', TOPPANO.onEmbeddedLinkChange);
    $('#menu .sidebar-content-share-height').on('input', TOPPANO.onEmbeddedLinkChange);
    TOPPANO.onEmbeddedLinkChange();
    new Clipboard('#menu .sidebar-content-share-copy', {
        text: function(trigger) {
            return $('#menu .sidebar-content-share-link').val();
        }
    });
};

// Add events of container that are related to UI.
TOPPANO.addContainerEvent = function() {
    var click = TOPPANO.ui.containerEvent.click;

    $('#container').on('mousedown touchstart', function(event) {
        click.lastMouseDown = new Date().getTime();
    }).on('mouseup touchend', function(event) {
        if(new Date().getTime() < (click.lastMouseDown + click.longClickDelay)) {
            click.count++;
            if(click.count === 1) {
                click.timer = setTimeout(function() {
                    // Single click: show/hide all UI.
                    $('#logo').toggleClass('ui-hidden');
                    $('#menu').toggleClass('ui-hidden');
                    click.count = 0;
                }, click.dblclickDelay);
            } else {
                // Double click: turn on/off fullscreen.
                // TODO: Fullscreen support for IOS Safari, Android Browser...
                if(screenfull.enabled) {
                    screenfull.toggle();
                } else {
                    if($.fullscreen.isFullScreen()) {
                        $.fullscreen.exit();
                    } else {
                        $('body').fullscreen();
                    }
                }
                clearTimeout(click.timer);
                click.count = 0;
            }
        }
    });
};

// Initialize common variables for ui.
TOPPANO.initCommon = function() {
    TOPPANO.ui.common.transitionEndEvent = TOPPANO.getTransitionEndEventName();
}

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

TOPPANO.getTransitionEndEventName = function() {
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    }

    for(t in transitions){
        if( el.style[t] !== undefined ){
            return transitions[t];
        }
    }
};

// Global ui variables initialization.
TOPPANO.ui = {
    // variables for Menu
    menuUI: {
        linkMinWidth: 240,
        linkMinHeight: 160,
        isLocked: false,
        currentClickedIcon: null
    },
    containerEvent: {
        click: {
            dblclickDelay: 300, // Delay for differentiate between single and double click
            count: 0,
            timer: null,
            longClickDelay: 150, // Delay for differentiate between short and long click
            lastMouseDown: 0,
            duration: 0
        }
    },
    // Facebook SDK parameters
    fbSdkParams: {
        appId: '589634317860022',
        version: 'v2.5'
    },
    // Google API parameters
    googleApiParams: {
        shortUrlKey: 'AIzaSyDh1jky-M2BSe5Dnq2CdZiqadfB7t0Qan4'
    },
    common: {
        transitionEndEvent: 'transitionend'
    }
};

