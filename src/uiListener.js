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
    var menu = from ? from.parent().parent() : to.parent().parent(),
        contentWrapper = $('.sidebar-content-wrapper', menu),
        fromClass = !from ? '' : from.attr('data-target-content'),
        toClass = !to ? '' : to.attr('data-target-content');

    TOPPANO.toggleMenuIcon(from);
    TOPPANO.toggleMenuIcon(to);
    TOPPANO.toggleMenuContent(fromClass);
    TOPPANO.changeMenuSize(to, function() {
        TOPPANO.toggleMenuContent(toClass);
        TOPPANO.ui.menuUI.isLocked = false;
    });
};

TOPPANO.changeContentHeight = function(contentClass) {
    var menu = $('#menu'),
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

    return height;
};

TOPPANO.toggleMenuIcon = function(icon) {
    if(icon) {
        icon.toggleClass('sidebar-icon-clicked');
    }
};

TOPPANO.toggleMenuContent = function(contentClass) {
    if(contentClass !== '') {
        $('#menu .' + contentClass).toggleClass('sidebar-content-shown');
    }
};

TOPPANO.changeMenuSize = function(to, callback) {
    var contentWrapper = $('#menu .sidebar-content-wrapper'),
        toClass = !to ? '' : to.attr('data-target-content'),
        toWidth = !to ? 0 : parseInt($('#menu .' + toClass).css('width')),
        toHeight = TOPPANO.changeContentHeight(toClass, menu);

    contentWrapper.animate({
        height: toHeight,
        width: toWidth
    }, TOPPANO.ui.menuUI.changeSizeDuration, 'swing', function() {
      callback()
    });
};

// Check is it portrait orientation on mobile device ?
TOPPANO.isMobilePortrait = function() {
    return TOPPANO.gv.mobile.isMobile && TOPPANO.gv.mobile.orientation === 'portrait';
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

        if(TOPPANO.isMobilePortrait()) {
            oldMenuHeight -= parseInt($('.sidebar-iconlist', menu).css('height'));
        }
        if((oldMenuHeight - newMenuHeight) !== 0) {
            TOPPANO.ui.menuUI.isLocked = true;
            TOPPANO.changeMenuSize(TOPPANO.ui.menuUI.currentClickedIcon, function() {
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

