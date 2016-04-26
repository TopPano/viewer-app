TOPPANO.ui.share.facebook = TOPPANO.ui.share.facebook || {
    init: function() {
        // Initialize Facebook SDK.
        $.ajaxSetup({
            cache: true
        });
        $.getScript('//connect.facebook.net/en_US/sdk.js', $.proxy(function() {
            FB.init({
                appId: this.props.appId,
                version: this.props.version
            });
            // Enable Facebook share button when sdk is loaded completely.
            $('#menu .sidebar-content-share-facebook').on('click', $.proxy(this.onFBShareBtnClick, this));
        }, this));
    },

    getHtml: function() {
        return '';
    },

    onFBShareBtnClick: function(e) {
        // Check that user has logged in Facebook and connected to our application,
        // i.e. the user has approved permissions we grant.
        FB.getLoginStatus($.proxy(function(response) {
            if (response.status === 'connected') {
                // Connected: get access token directly.
                var accessToken = response.authResponse.accessToken;
                this.share(accessToken);
            } else {
                // Not connected: login, approve and get access token.
                FB.login($.proxy(function(response) {
                    if(response.authResponse) {
                        var accessToken = FB.getAuthResponse().accessToken;
                        this.share(accessToken);
                    } else {
                        // TODO: Hnadle response.authResponse is not defined.
                    }
                }, this), { scope: 'publish_actions' });
            }

        }, this));
    },

    // Upload photo and share link to Facebook.
    share: function(accessToken) {
        // Open loading page before uploading photo.
        TOPPANO.ui.loader.open();

        // Get the snapshot from the current angle.
        var snapshot = this.base64toBlob(TOPPANO.getSnapshot($(window).width(), $(window).height()));
        this.uploadPhoto(accessToken, snapshot).done($.proxy(function(response) {
            // Get URL of the uploaded photo.
            var snapshotUrl = 'https://graph.facebook.com/' + response.id + '/picture?access_token=' + accessToken;
            this.shortenUrl(snapshotUrl).done($.proxy(function(response) {
                // Shorten the URL.
                // We use the shorter URL because the original URL of uploaded snapshot (fb.cdn)
                // is not allowed in Facebook previewe image.
                var shortUrl = response.id;

                // Close loading page after uploading photo successfully.
                TOPPANO.ui.loader.close();

                var description = $('#menu .sidebar-content-info-message').val();
                var currentUrl = TOPPANO.gv.currentUrl;
                // Test whether description is empty string (whitespace) or not.
                description = description.trim() ? description : 'Verpix';
                // Post to Facebook.
                this.post(description, currentUrl, shortUrl);
            }, this)).fail(function(jqXHR, textStatus, errorThrown) {
                // Erros occur when shortening the URL, just close the loaing page.
                TOPPANO.ui.loader.close();
            });
        }, this)).fail(function(jqXHR, textStatus, errorThrown) {
            // Error occur when uploading the photo to Facebook, just close the loaing page.
            TOPPANO.ui.loader.close();
        });
    },

    // Upload an image to Facebook by using Graph API.
    uploadPhoto: function(accessToken, photo) {
        var data = new FormData();

        data.append('access_token', accessToken);
        data.append('source', photo);
        data.append('privacy', JSON.stringify({ 'value': 'SELF' }));
        // Upload the photo to user's Facebook by using multipart/form-data post.
        return $.ajax({
            url: 'https://graph.facebook.com/me/photos?access_token=' + accessToken,
            type: 'POST',
            contentType: false,
            processData: false,
            data: data
        });
    },

    // Shorten URL by using Google URL Shortener.
    shortenUrl: function(longUrl) {
        return $.ajax({
            url : 'https://www.googleapis.com/urlshortener/v1/url?key=' + this.props.googleShortUrlKey,
            type: 'POST',
            data: JSON.stringify({
                longUrl: longUrl
            }),
            contentType: 'application/json'
        });
    },

    // Post to Facebook by using Dialog API.
    post: function(title, linkUrl, imgUrl) {
        FB.ui({
            method: 'share_open_graph',
            display: 'popup',
            action_type: 'news.publishes',
            action_properties: JSON.stringify({
                article: {
                    type: 'article',
                    title: title,
                    url: linkUrl,
                    image: imgUrl
                }
            })
        }, function(response) {
            // TODO: Show success message after posting.
        });
    },

    // Convert a base64-encoded image to a Blob.
    base64toBlob: function(dataUrl) {
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
    },

    props: {
        // Facebook application ID.
        appId: '589634317860022',
        // Facebook SDK version.
        version: 'v2.5',
        // Google URL Shortener API key.
        googleShortUrlKey: 'AIzaSyDMWU0bIoW4FS1OvfCT_X8OCBfe6CLOsCw'
    }
}

