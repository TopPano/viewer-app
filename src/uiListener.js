TOPPANO.onMenuBtnClick = function(event) {
    var menu = $(this).parent();

    if(menu.hasClass('sidebar-collapsed')) {
        menu.addClass('sidebar-partial-expanded');
    } else if(menu.hasClass('sidebar-partial-expanded')) {
        menu.removeClass('sidebar-partial-expanded');
    } else {
        TOPPANO.changeContents(TOPPANO.ui.menuUI.currentClickedIcon, null);
        menu.removeClass('sidebar-expanded');
        TOPPANO.ui.menuUI.currentClickedIcon = null;
    }
    menu.toggleClass('sidebar-collapsed');
};

TOPPANO.onMenuIconClick = function(event) {
    var menu = $(this).parent().parent();
    var clickedIcon = $(this);

    if(menu.hasClass('sidebar-partial-expanded')) {
        // Menu is partially expanded.
        TOPPANO.changeContents(null, clickedIcon);
        menu.removeClass('sidebar-partial-expanded').addClass('sidebar-expanded');
        TOPPANO.ui.menuUI.currentClickedIcon = clickedIcon;
    } else if(TOPPANO.ui.menuUI.currentClickedIcon.attr('class') === clickedIcon.attr('class')) {
        // Menu is fully expanded and the same icon is clicked.
        TOPPANO.changeContents(clickedIcon, null);
        menu.removeClass('sidebar-expanded').addClass('sidebar-partial-expanded');
        TOPPANO.ui.menuUI.currentClickedIcon = null;
    } else {
        // Menu is fully expanded and a different icon is clicked.
        TOPPANO.changeContents(TOPPANO.ui.menuUI.currentClickedIcon, clickedIcon);
        TOPPANO.ui.menuUI.currentClickedIcon = clickedIcon;
    }
};

TOPPANO.changeContents = function(from, to) {
    var fromWidth = !from ? 0 : TOPPANO.getContentWidth(from),
        toWidth = !to ? 0 : TOPPANO.getContentWidth(to);

    if((fromWidth - toWidth) === 0) {
        TOPPANO.toggleMenuClickedIcon(from, 'start');
        TOPPANO.toggleMenuClickedIcon(to, 'start');
    } else {
        TOPPANO.toggleMenuClickedIcon(from, 'start');
        TOPPANO.toggleMenuClickedIcon(to, 'end');
    }
};

TOPPANO.getContentWidth = function(icon) {
    var menu = icon.parent().parent();
    var contentClass = icon.attr('data-target-content');
    var contentSize = $('.' + contentClass, menu).attr('data-content-size');

    return TOPPANO.ui.menuUI.width[contentSize];
};

TOPPANO.toggleMenuClickedIcon = function(icon, whenToggleContent) {
    if(icon) {
        var menu = icon.parent().parent();
        var contentWrapper = $('.sidebar-content-wrapper', menu);
        var contentClass = icon.attr('data-target-content');
        var contentSize = $('.' + contentClass, menu).attr('data-content-size');

        if(whenToggleContent === 'start') {
            $('.' + contentClass).toggle();
        } else if(whenToggleContent === 'end') {
            contentWrapper.one(TOPPANO.getTransitionEndEventName(), function(event) {
                $('.' + contentClass).toggle();
            });
        }
        icon.toggleClass('sidebar-icon-clicked');
        contentWrapper.toggleClass('sidebar-contentsize-' + contentSize);
    }
};

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

TOPPANO.onLikeIconClick = function() {
    var icon = $(this);
    var count = $('.likebtn-count', icon.parent());
    var likes = parseInt(count.html());
    var url = TOPPANO.gv.apiUrl + '/posts/' + TOPPANO.gv.modelID;

    if(icon.hasClass('likebtn-icon-clicked')) {
        url += '/unlike'
        likes--;
    } else {
        url += '/like'
        likes++;
    }
    $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            // TODO: Fill the correct user ID.
            'userId': 'jelly-fish-ma'
        })
    }).done(function(response) {
        count.html(likes);
        icon.toggleClass('likebtn-icon-clicked');
    }).fail(function(jqXHR, textStatus, errorThrown) {
        // TODO: Error handling.
    });
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
            var snapshot = TOPPANO.base64toBlob(TOPPANO.getSnapshot(800, 600));
            var data = new FormData();

            data.append('access_token', accessToken);
            data.append('source', snapshot);
            data.append('message', 'HAHAHA');
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
                var currentUrl = window.location.href;

                // 4. Share to Facebook by using Dialog API.
                //    The shorter URL of uploaded snapshot is used a the preview image.
                FB.ui({
                    appId: TOPPANO.ui.fbSdkParams.appId,
                    method: 'feed',
                    display: 'iframe',
                    link: currentUrl,
                    name: 'Jellyfish',
                    picture: shortUrl,
                    description: 'The most beautiful jellyfish!'
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
    var url = "https://twitter.com/intent/tweet?url="+document.URL;
    window.open(url,'name',spec);
};


TOPPANO.onQMarkClick = function(){
    $('#how_to_use').bPopup();
}

// Listener for embedded link width or height field changes.
TOPPANO.onEmbeddedLinkChange = function(event) {
    var width = parseInt($('#menu .sidebar-content-share-width').val());
    var height = parseInt($('#menu .sidebar-content-share-height').val());
    var minWidth = TOPPANO.ui.menuUI.linkMinWidth;
    var minHeight = TOPPANO.ui.menuUI.linkMinHeight;
    var currentUrl = window.location.href;
    var link =
        '<iframe width="' + ((isNaN(width) || width < minWidth) ? minWidth : width) +
        '" height="' + ((isNaN(height) || height < minHeight) ? minHeight : height) +
        '" src="' + currentUrl +
        '" style="border: none" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    $('#menu .sidebar-content-share-output').html(link);
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

