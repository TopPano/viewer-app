TOPPANO.ui.user = TOPPANO.ui.user || {
    init: function(user) {
        if(this.hasLogin()) {
            this.setUsername(Cookies.get('userId'), Cookies.get('token'));
        }
        this.initSignup();
        this.initLogin();
        this.initLike(user.likes, user.hasLike);
    },

    initSignup: function() {
        $('#account-signup .account-btn').on('click', $.proxy(function(e) {
            var signup = $('#account-signup');
            var username = $('.account-signup-username', signup).val(),
                email = $('.account-signup-email', signup).val(),
                password = $('.account-signup-password', signup).val();

            this.signup(username, email, password);
        }, this));
    },

    initLogin: function() {
        $('#account-login .account-btn').on('click', $.proxy(function(e) {
            var login = $('#account-login');
            var email = $('.account-login-email', login).val(),
                password = $('.account-login-password', login).val();

            this.login(email, password);
        }, this));
    },

    initLike: function(likes, hasLike) {
        this.setLikesCount(likes);
        if(hasLike) {
            $('#like-btn .likebtn-icon').addClass('likebtn-icon-clicked');
        }
        $('#like-btn .likebtn-icon').on('click', $.proxy(function(e) {
            var userId = Cookies.get('userId');
            if(!this.hasLogin()) {
                this.showSignupLogin();
            } else {
                this.likePost(userId);
            }
        }, this));
    },

    signup: function(username, email, password) {
        var url = TOPPANO.gv.apiUrl + '/users';

        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify({
                username: username,
                email: email,
                password: password
            }),
            contentType: 'application/json'
        }).done($.proxy(function(response) {
            this.login(email, password);
        }, this)).fail(function(jqXHR, textStatus, errorThrown) {
            // TODO: Error handling.
        });
    },

    login: function(email, password) {
        var url = TOPPANO.gv.apiUrl + '/users/login';

        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify({
                email: email,
                password: password
            }),
            contentType: 'application/json'
        }).done($.proxy(function(response) {
            var userId = response.userId,
                token = response.id,
                expires = new Date(response.created);

            expires.setSeconds(expires.getSeconds() + response.ttl);
            Cookies.set('userId', userId, { expires: expires });
            Cookies.set('token', token, { expires: expires });
            this.hideSignupLogin();
            this.setUsername(userId, token);
            // TODO: Update hasLike after user login.
            // TODO: Use callback instead of using likePost directly.
            this.likePost(userId);
        }, this)).fail(function(jqXHR, textStatus, errorThrown) {
            // TODO: Error handling.
        });
    },

    likePost: function(userId) {
        var icon = $('#like-btn .likebtn-icon');
        var likes = this.getLikesCount();
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
                userId: userId
            })
        }).done($.proxy(function(response) {
            this.setLikesCount(likes);
            icon.toggleClass('likebtn-icon-clicked');
        }, this)).fail(function(jqXHR, textStatus, errorThrown) {
            // TODO: Error handling.
        });
    },

    hasLogin: function() {
        return Cookies.get('token') && Cookies.get('userId');
    },

    showSignupLogin: function() {
        $.magnificPopup.open({
            items: {
                src: '#account-login',
                type: 'inline',
            },
            showCloseBtn: false
        });
    },

    hideSignupLogin: function() {
        $.magnificPopup.close();
    },

    setUsername: function(userId, token) {
        var url = TOPPANO.gv.apiUrl + '/users/' + userId  + '?access_token=' + token;
        
        $.ajax({
            url: url,
            type: 'GET'
        }).done(function(response) {
            $('#logo .logo-bar-username').html(response.username);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            // TODO: Error handling.
        });
    },

    setLikesCount: function(likes) {
        $('#like-btn .likebtn-count').html((likes === 0) ? '' : likes);
    },

    getLikesCount: function() {
        var likes = parseInt($('#like-btn .likebtn-count').html());
        return isNaN(likes) ? 0 : likes;
    },
};

