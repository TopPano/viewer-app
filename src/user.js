TOPPANO.ui.user = TOPPANO.ui.user || {
    init: function(user) {
        if(this.isLogin()) {
            this.setUsername(Cookies.get('userId'), Cookies.get('token'));
        }
        this.initSignup();
        this.initLogin();
        this.initLike(user.likes.count, user.likes.isLiked);
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

    initLike: function(count, isLiked) {
        this.setLikesCount(count);
        if(isLiked) {
            $('#like-btn .likebtn-icon').addClass('likebtn-icon-clicked');
        }
        $('#like-btn .likebtn-icon').on('click', $.proxy(function(e) {
            var userId = Cookies.get('userId');
            if(!this.isLogin()) {
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
            $.ajax({
                url: TOPPANO.gv.apiUrl + '/posts/' + TOPPANO.gv.modelID + '?access_token=' + token,
                type: 'GET'
            }).done(function(response) {
                if(response.likes.isLiked) {
                    $('#like-btn .likebtn-icon').addClass('likebtn-icon-clicked');
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                // TODO: Error handling.
            });
        }, this)).fail(function(jqXHR, textStatus, errorThrown) {
            // TODO: Error handling.
        });
    },

    likePost: function(userId) {
        var icon = $('#like-btn .likebtn-icon');
        var count = this.getLikesCount();
        var url = TOPPANO.gv.apiUrl + '/posts/' + TOPPANO.gv.modelID;

        if(icon.hasClass('likebtn-icon-clicked')) {
            url += '/unlike'
            count--;
        } else {
            url += '/like'
            count++;
        }
        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId
            })
        }).done($.proxy(function(response) {
            this.setLikesCount(count);
            icon.toggleClass('likebtn-icon-clicked');
        }, this)).fail(function(jqXHR, textStatus, errorThrown) {
            // TODO: Error handling.
        });
    },

    isLogin: function() {
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

    setLikesCount: function(count) {
        $('#like-btn .likebtn-count').html((count === 0) ? '' : count);
    },

    getLikesCount: function() {
        var count = parseInt($('#like-btn .likebtn-count').html());
        return isNaN(count) ? 0 : count;
    }
};

