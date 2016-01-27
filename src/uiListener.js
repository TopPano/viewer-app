// Listener for clicking Summary button.
TOPPANO.onSummaryBtnClick = function(event) {
    var summaryBtn = $('#summary-btn');
    var summaryMain = $('#summary-main');

    // When the main block is about to be closed, we should collapse
    // the main block if it is expanded.
    if(summaryBtn.hasClass('ui-icon-arrow-r') && !summaryMain.hasClass('ui-collapsible-collapsed')) {
        $('#summary-main .ui-collapsible-heading-toggle').trigger('click');
        summaryMain.delay(TOPPANO.ui.summaryUI.animateDelay);
    }
    summaryMain.animate({width: 'toggle' }, TOPPANO.ui.summaryUI.animateDelay, function() {
        summaryBtn.toggleClass('ui-icon-arrow-r');
        summaryBtn.toggleClass('ui-icon-arrow-l');
    });
};

// Listener for clicking Summary head block.
TOPPANO.onSummaryMainClick = function(event) {
    $('.ui-collapsible-content', $('#summary-main')).slideToggle(TOPPANO.ui.summaryUI.animateDelay);
};

// Listener for clicking fullscreen button.
TOPPANO.onFullscreenBtnClick = function(event) {
    if($.fullscreen.isFullScreen()) {
        $.fullscreen.exit();
    } else {
        $('body').fullscreen();
    }
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
                    // 5. Show message when posting is completed successfully.
                    if(response && response['post_id']) {
                        var resultDialog = $('#fb-share-result-dialog').popup('open');
                        setTimeout(function() {
                            // Check whether it is closed by user before we close it.
                            if(resultDialog.parent().hasClass('ui-popup-active')) {
                                resultDialog.popup('close');
                            }
                        }, 2000);
                    }
                });
            });
        } else {
            // TODO: Hnadle response['authResponse'] is not defined.
        }
    }, { scope: 'publish_actions' });
};

// Listener for embedded link width or height field changes.
TOPPANO.onEmbeddedLinkChange = function(event) {
    var width = parseInt($('#embedded-link-width').val());
    var height = parseInt($('#embedded-link-height').val());
    var minWidth = TOPPANO.ui.embeddedLinkUI.minWidth;
    var minHeight = TOPPANO.ui.embeddedLinkUI.minHeight;
    var currentUrl = window.location.href;
    var link =
        '<iframe width="' + ((isNaN(width) || width < minWidth) ? minWidth : width) +
        '" height="' + ((isNaN(height) || height < minHeight) ? minHeight : height) +
        '" src="' + currentUrl +
        '" style="border: none" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    $('#embedded-link-output').val(link);
};
TOPPANO.onSGImgClick = function(prop) {
    TOPPANO.transitNode(prop.nodeId, prop.lng, prop.lat, prop.fov);
};

// Transit current node to another node.
TOPPANO.transitNode = function(targetNodeId, lng, lat, fov) {
    TOPPANO.changeView(targetNodeId, lng, lat, fov);
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

