TOPPANO.ui.likelist = TOPPANO.ui.likelist || {
    init: function() {
    },

    getHtml: function() {
        return ' \
        <div id="likelist" class="likelist mfp-hide"> \
            <div class="likelist-title">People who like this</div> \
        </div>';
    },

    open: function(userId, token) {
        var url = TOPPANO.gv.apiUrl + '/posts/' + TOPPANO.gv.modelID + '/likes?access_token=' + token;

        $.ajax({
            url: url,
            type: 'GET'
        }).done($.proxy(function(response) {
            this.renderList(response.result, userId);
            TOPPANO.ui.utils.openDialog({
                items: {
                    src: '#likelist',
                    type: 'inline'
                },
                showCloseBtn: false
            });
        }, this)).fail(function(jqXHR, textStatus, errorThrown) {
            // TODO: Error handling.
        });
    },

    renderList: function(list, userId) {
        var html = '';

        $('#likelist .likelist-item').remove();
        $.each(list, $.proxy(function(index, item) {
            if(item.user) {
                var profileUrl = item.user.profilePhotoUrl ? item.user.profilePhotoUrl : 'images/author-picture-default.png';
                var name = item.user.username;
                var isFollowing = item.user.followers.length > 0;
                //var showFollow = userId !== item.userId;
                var showFollow = false;
                html += this.renderItem(profileUrl, name, isFollowing, showFollow);
            }
        }, this));
        $(html).appendTo('#likelist');
    },

    renderItem: function(profileUrl, name, isFollowing, showFollow) {
        var html = ' \
            <div class="likelist-item"> \
                <img class="likelist-item-profile" src="$profileUrl$" alt=""> \
                <div class="likelist-item-name">$name$</div> \
                <div class="$followClass$">$followStr$</div> \
            </div>';
        var followClass =  isFollowing ? 'likelist-item-follow likelist-item-following' : 'likelist-item-follow';
        var followStr = isFollowing ? 'following' : 'follow';
        followClass += showFollow ? '' : ' likelist-item-follow-hidden';
        html = html.replace('$profileUrl$', profileUrl)
                .replace('$name$', name)
                .replace('$followClass$', followClass)
                .replace('$followStr$', followStr);
        return html;
    }
}

