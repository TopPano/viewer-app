// Create laytouts of all ui components.
TOPPANO.createUILayout = function() {
    var ui = getUrlParam('ui');
    if(ui !== 'off') {
        $('#app-wrapper').append(' \
            <div id="logo" class="logo-bar"> \
                <img id="logo_img" src="./images/logo.png"></img> \
                <div class="logo-bar-username text-singleline"></div> \
                <div class="logo-bar-help" data-mfp-src="./images/how_to_use.png"></div> \
                <div id="like-btn" class="likebtn"> \
                    <div class="likebtn-icon"></div> \
                    <div class="likebtn-count-wrapper"><div class="likebtn-count"></div></div> \
                </div> \
            </div> \
            <div id="account" class="account"> \
                <div id="account-signup" class="account-signup account-dialog"> \
                    <div class="account-dialog-content"> \
                        <input type="text" class="account-signup-username" placeholder="Name"> \
                        <input type="email" class="account-signup-email" placeholder="Email"> \
                        <input type="password" class="account-signup-password" placeholder="Password"> \
                        <div class="account-btn">JOIN</div> \
                    </div> \
                </div> \
                <div id="account-login" class="account-login account-dialog"> \
                    <div class="account-dialog-content"> \
                        <input type="email" class="account-login-email" placeholder="Email"> \
                        <input type="password" class="account-login-password" placeholder="Password"> \
                        <div class="account-btn">LOG IN</div> \
                    </div> \
                    <div class="account-btn account-btn-to-signup">JOIN NOW</div> \
                </div> \
                <div id="account-err" class="account-err account-dialog"> \
                    <div class="account-dialog-content"> \
                        <div class="account-text"></div> \
                        <div class="account-btn">GO BACK</div> \
                    </div> \
                </div> \
            </div> \
            <div id="menu" class="sidebar sidebar-collapsed"> \
                <div class="sidebar-content-wrapper"> \
                    <div class="sidebar-content sidebar-content-info"> \
                        <img src="images/author-picture-default.png" alt="Author Picture"></img> \
                        <div class="sidebar-content-info-title"> \
                            <div class="sidebar-content-info-author text-singleline"></div> \
                            <div class="sidebar-content-info-date text-singleline"></div> \
                        </div> \
                        <textarea class="sidebar-content-info-message" disabled></textarea> \
                    </div> \
                    <div class="sidebar-content sidebar-content-tag"></div> \
                    <div class="sidebar-content sidebar-content-share"> \
                        <div class="sidebar-content-share-iconlist"> \
                            <div class="sidebar-content-share-icon sidebar-content-share-facebook"></div> \
                            <div class="sidebar-content-share-icon sidebar-content-share-twitter"></div> \
                            <div class="sidebar-content-share-icon sidebar-content-share-copy"></div> \
                        </div> \
                        <div class="sidebar-content-share-size"> \
                            <input type="text" class="sidebar-content-share-width" value="240" placeholder="width"> \
                            <div class="sidebar-content-share-multiply">X</div> \
                            <input type="text" class="sidebar-content-share-height" value="160" placeholder="height"> \
                        </div> \
                        <div class="sidebar-content-share-linkwrapper"><textarea class="sidebar-content-share-link" disabled></textarea></div> \
                    </div> \
                </div> \
            </div> \
            <div id="progress-div"> \
                <progress class="progress-bar" value="0" max="100"></progress> \
            </div> \
        ');

        var sidebarIconlist = ' \
            <div class="sidebar-title">MENU</div> \
            <div class="sidebar-iconlist"> \
                <div class="sidebar-icon sidebar-icon-info" data-target-content="sidebar-content-info"></div> \
                <div class="sidebar-icon sidebar-icon-tag" data-target-content="sidebar-content-tag"></div> \
                <div class="sidebar-icon sidebar-icon-share" data-target-content="sidebar-content-share"></div> \
            </div>';

        if(TOPPANO.gv.isMobile) {
            $(sidebarIconlist).insertAfter('#menu .sidebar-content-wrapper');
            $('#app-wrapper *').addClass('ui-mobile');
        } else {
            $(sidebarIconlist).insertBefore('#menu .sidebar-content-wrapper');
            $('#app-wrapper *').addClass('ui-desktop');
        }
    }
};

// Fill the contents and listeners of all UI components
TOPPANO.fillUIContents = function(post) {
    var ui = getUrlParam('ui');
    if(ui !== 'off') {
        TOPPANO.createMenu(post.menu);
        TOPPANO.ui.user.init(post.user);
        TOPPANO.initQMark();
        TOPPANO.addContainerEvent();
    }
};

// Create a sidebar menu.
TOPPANO.createMenu = function(menu) {
    TOPPANO.initCommon();
    TOPPANO.initFB();
    TOPPANO.initTwitter();
    if(menu.info.authorPicture) {
        $('#menu .sidebar-content-info img').attr('src', menu.info.authorPicture);
    }
    $('#menu .sidebar-content-info-author').html(menu.info.author);
    $('#menu .sidebar-content-info-date').html(TOPPANO.transDateFormat(menu.info.date));
    $('#menu .sidebar-content-info-message').val(menu.info.message);
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
    var startEvent, endEvent;

    if(TOPPANO.gv.isMobile) {
        startEvent = 'touchstart';
        endEvent = 'touchend';
    } else {
        startEvent = 'mousedown';
        endEvent = 'mouseup';
    }

    $('#container').on(startEvent, function(event) {
        click.lastMouseDown = new Date().getTime();
    }).on(endEvent, function(event) {
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
    $('#logo .logo-bar-help').magnificPopup({
        type: 'image',
        showCloseBtn: false,
        image: {
            cursor: 'mfp-auto-cur',
            verticalFit: true
        },
    });
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

// Transfrom the date to our format.
TOPPANO.transDateFormat = function(dateRaw) {
    var date = new Date(dateRaw);
    return date.getFullYear() + '/' +
        date.getMonth() + '/' +
        date.getDay() + ' ' +
        date.getHours() + ':' +
        date.getMinutes();
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

