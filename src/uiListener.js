TOPPANO.onMenuIconClick = function(event) {
    if(!TOPPANO.ui.menuUI.isLocked) {
        TOPPANO.ui.menuUI.isLocked = true;

        var menu = $(this).parent().parent();
        var clickedIcon = $(this);

        if(menu.hasClass('sidebar-collapsed')) {
            // Menu is collapsed.
            TOPPANO.changeContents(null, clickedIcon);
            menu.removeClass('sidebar-collapsed').addClass('sidebar-expanded');
            TOPPANO.ui.menuUI.currentClickedIcon = clickedIcon;
        } else if(TOPPANO.ui.menuUI.currentClickedIcon.attr('class') === clickedIcon.attr('class')) {
            // Menu is expanded and the same icon is clicked.
            TOPPANO.changeContents(clickedIcon, null);
            menu.removeClass('sidebar-expanded').addClass('sidebar-collapsed');
            TOPPANO.ui.menuUI.currentClickedIcon = null;
        } else {
            // Menu is expanded and a different icon is clicked.
            TOPPANO.changeContents(TOPPANO.ui.menuUI.currentClickedIcon, clickedIcon);
            TOPPANO.ui.menuUI.currentClickedIcon = clickedIcon;
        }
    }
};

TOPPANO.changeContents = function(from, to) {
    // Assume that at least one of them is defined.
    var menu = from ? from.parent().parent() : to.parent().parent();
    var contentWrapper = $('.sidebar-content-wrapper', menu);
    var fromClass = !from ? '' : from.attr('data-target-content'),
        fromWidth = !from ? 0 : parseInt($('.' + fromClass, menu).css('width')),
        fromHeight = parseInt(menu.css('height'));
    var toClass = !to ? '' : to.attr('data-target-content'),
        toWidth = !to ? 0 : parseInt($('.' + toClass, menu).css('width')),
        toHeight = TOPPANO.changeContentHeight(toClass, menu);

    TOPPANO.toggleMenuIcon(from);
    TOPPANO.toggleMenuIcon(to);
    TOPPANO.toggleMenuContent(fromClass, menu);
    TOPPANO.changeMenuSize(menu, contentWrapper, fromWidth, fromHeight, toWidth, toHeight, function() {
        TOPPANO.toggleMenuContent(toClass, menu);
        TOPPANO.ui.menuUI.isLocked = false;
    });
};

TOPPANO.changeContentHeight = function(contentClass, menu) {
    var minHeight = parseInt(menu.css('min-height')),
        height = 0;

    switch(contentClass) {
        case 'sidebar-content-info':
            var message = $('.sidebar-content-info-message', menu);
            var messageMinHeight = message.css('min-height'),
                messageHeight = message.prop('scrollHeight');
            messageHeight = (messageHeight < messageMinHeight) ? messageMinHeight : messageHeight;
            message.css('height', messageHeight + 'px');
            height = parseInt($('.' + contentClass).css('height'));
            break;
        case 'sidebar-content-tag':
            height = 0;
            break;
        case 'sidebar-content-share':
            // TODO: The property 'scrollHeight' may not decrease when link value length decreases.
            var link = $('.sidebar-content-share-link', menu),
                wrapper = link.parent();
            var wrapperMinHeight = wrapper.css('min-height'),
                wrapperHeight = link.prop('scrollHeight')
                    + parseInt(wrapper.css('padding-top')) + parseInt(wrapper.css('padding-bottom'));
            wrapperHeight = (wrapperHeight < wrapperMinHeight) ? wrapperMinHeight : wrapperHeight;
            wrapper.css('height', wrapperHeight + 'px');
            height = parseInt($('.' + contentClass).css('height'));
            break;
    }

    if(TOPPANO.isMobilePortrait()) {
        return height + minHeight;
    } else {
        return (height < minHeight) ? minHeight: height;
    }
};

TOPPANO.toggleMenuIcon = function(icon) {
    if(icon) {
        icon.toggleClass('sidebar-icon-clicked');
    }
};

TOPPANO.toggleMenuContent = function(contentClass) {
    if(contentClass !== '') {
        $('.' + contentClass, menu).toggleClass('sidebar-content-shown');
    }
};

TOPPANO.changeMenuSize = function(menu, contentWrapper, fromWidth, fromHeight, toWidth, toHeight, callback) {
    var heightChanger, widthChanger;

    if(TOPPANO.isMobilePortrait()) {
        heightChanger = contentWrapper;
        widthChanger = menu;
    } else {
        heightChanger = menu;
        widthChanger = contentWrapper;
    }

    if((fromHeight - toHeight) !== 0) {
        if(TOPPANO.isMobilePortrait()) {
            toHeight -= parseInt(menu.css('min-height'));
        }
        heightChanger.on(TOPPANO.ui.common.transitionEndEvent, function(event) {
            if(event.originalEvent.propertyName === 'height') {
                heightChanger.off(TOPPANO.ui.common.transitionEndEvent);
                event.stopPropagation();
                callback();
            }
        });
        if((fromWidth - toWidth) !== 0) {
            widthChanger.css('width', toWidth + 'px');
        }
        heightChanger.css('height', toHeight + 'px');
    } else if((fromWidth - toWidth) !== 0) {
        widthChanger.on(TOPPANO.ui.common.transitionEndEvent, function(event) {
            if(event.originalEvent.propertyName === 'width') {
                widthChanger.off(TOPPANO.ui.common.transitionEndEvent);
                event.stopPropagation();
                callback();
            }
        });
        widthChanger.css('width', toWidth + 'px');
    } else {
        callback();
    }
};

// Check is it portrait orientation on mobile device ?
TOPPANO.isMobilePortrait = function() {
    return TOPPANO.gv.mobile.isMobile && TOPPANO.gv.mobile.orientation === 'portrait';
};

// Listener for clicking Facebook sharing button.
TOPPANO.onFBShareBtnClick = function(event) {
    // Steps for sharing to Facebook:
    // 1. Facebook Login and get publish permission.
    // 2. Upload a snapshot to user's Facebook.
    // 3. Generate a shorter URL for the uploaded snapshot.
    // 4. Share to Facebook, use the uploaded snapshot as preview image.
    // 5. Pop up message if users successfully shares to Facebook.

    // 1. Login Facebook using API, we should get "publish_actions" permission
    //    so we can upload a snapshot to user's Facebook.
    FB.login(function(response) {
        if(response['authResponse']) {
            var accessToken = FB.getAuthResponse()['accessToken'];
            var currentUrl = TOPPANO.gv.currentUrl;
            var snapshot = TOPPANO.base64toBlob(TOPPANO.getSnapshot($(window).width(), $(window).height()));
            var description = $('#menu .sidebar-content-info-message').val();
            var data = new FormData();

            data.append('access_token', accessToken);
            data.append('source', snapshot);
            //data.append('message', 'HAHAHA');
            // 2. Upload the snapshot to user's Facebook by using multipart/form-data post.
            $.ajax({
                url: 'https://graph.facebook.com/me/photos?access_token=' + accessToken,
                type: 'POST',
                contentType: false,
                processData: false,
                data: data
            }).then(function(response) {
                // 3. Generate a shorter URL by using Google URL Shortener API.
                //    We use the shorter URL because the original URL of uploaded snapshot (fb.cdn)
                //    is not allowed in Facebook previewe image.
                return $.ajax({
                    url : 'https://www.googleapis.com/urlshortener/v1/url?key=' + TOPPANO.ui.googleApiParams.shortUrlKey,
                    type: 'POST',
                    data: JSON.stringify({
                        longUrl: 'https://graph.facebook.com/' + response['id'] + '/picture?access_token=' + accessToken
                    }),
                    contentType: 'application/json'
                });
            }).done(function(response) {
                var shortUrl = response['id'];

                // 4. Share to Facebook by using Dialog API.
                //    The shorter URL of uploaded snapshot is used a the preview image.
                FB.ui({
                    appId: TOPPANO.ui.fbSdkParams.appId,
                    method: 'feed',
                    display: 'iframe',
                    link: currentUrl,
                    name: description,
                    picture: shortUrl,
                }, function(response){
                    // 5. TODO: Show message when posting is completed successfully.
                });
            });
        } else {
            // TODO: Hnadle response['authResponse'] is not defined.
        }
    }, { scope: 'publish_actions' });
};

TOPPANO.onTwitterShareBtnClick = function() {
    var position_left = screen.width/2-400;
    var position_top = screen.height/2-200;
    var spec ='height=400,width=800,top='+position_top.toString()+',left='+position_left.toString();
    var url = "https://twitter.com/intent/tweet?url=" + encodeURIComponent(TOPPANO.gv.currentUrl);
    window.open(url,'name',spec);
};


// Listener for embedded link width or height field changes.
TOPPANO.onEmbeddedLinkChange = function() {
    var menu = $('#menu');
    var contentWrapper = $('.sidebar-content-wrapper', menu);
    var width = parseInt($('.sidebar-content-share-width', menu).val());
    var height = parseInt($('.sidebar-content-share-height', menu).val());
    var minWidth = TOPPANO.ui.menuUI.linkMinWidth;
    var minHeight = TOPPANO.ui.menuUI.linkMinHeight;
    var code =
        '<iframe width="' + ((isNaN(width) || width < minWidth) ? minWidth : width) +
        '" height="' + ((isNaN(height) || height < minHeight) ? minHeight : height) +
        '" src="' + TOPPANO.gv.currentUrl +
        '" style="border: none" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    $('textarea.sidebar-content-share-link', menu).val(code);

    if($('.sidebar-content-share', menu).hasClass('sidebar-content-shown') && !TOPPANO.ui.menuUI.isLocked) {
        var oldMenuHeight = parseInt(menu.css('height'));
        var newMenuHeight = TOPPANO.changeContentHeight('sidebar-content-share', menu);
        if((oldMenuHeight - newMenuHeight) !== 0) {
            TOPPANO.ui.menuUI.isLocked = true;
            TOPPANO.changeMenuSize(menu, contentWrapper, 0, oldMenuHeight, 0, newMenuHeight, function() {
                TOPPANO.ui.menuUI.isLocked = false;
            });
        }
    }
};

// Convert a base64-encoded image to a Blob.
TOPPANO.base64toBlob = function(dataUrl) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataUrl.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataUrl.split(',')[1]);
    } else {
        byteString = unescape(dataUrl.split(',')[1]);
    }

    // separate out the mime component
    var mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
};

