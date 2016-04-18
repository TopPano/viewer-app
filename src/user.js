TOPPANO.ui.user = TOPPANO.ui.user || {
    init: function(user) {
        $('.account-dialog').not('.account-dialog-content').on('click', function(event) {
            // Only the original target (dialog body) triggers closing dialog function.
            if(event.target === this) {
                TOPPANO.ui.utils.closeDialog();
            }
        });
        if(this.isLogin()) {
            this.setUsername(Cookies.get('userId'), Cookies.get('token'));
        }
        this.initSignup();
        this.initLogin();
        this.initLike(user.likes.count, user.likes.isLiked);
    },

    initSignup: function() {
        $('#account-signup .account-dialog-content .account-btn').on('click', $.proxy(function(e) {
            var signup = $('#account-signup');
            var username = $('.account-signup-username', signup).val(),
                email = $('.account-signup-email', signup).val(),
                password = $('.account-signup-password', signup).val();

            if(this.checkSignupInput(username, email, password)) {
                this.signup(username, email, password);
            }
        }, this));
        $('#account-signup .account-btn-facebook').on('click', $.proxy(function(e) {
            this.facebookLogin()
        }, this));
    },

    initLogin: function() {
        $('#account-login .account-dialog-content .account-btn').on('click', $.proxy(function(e) {
            var login = $('#account-login');
            var email = $('.account-login-email', login).val(),
                password = $('.account-login-password', login).val();

            if(this.checkLoginInput(email, password)) {
                this.login(email, password);
            }
        }, this));
        $('#account-login .account-btn.account-btn-to-signup').on('click', $.proxy(function(e) {
            this.showDialog('signup');
        }, this));
        $('#account-login .account-btn-facebook').on('click', $.proxy(function(e) {
            this.facebookLogin()
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
                this.showDialog('login');
            } else {
                this.likePost(userId);
            }
        }, this));
        $('#like-btn .likebtn-count').on('click', $.proxy(function(e) {
            var userId = Cookies.get('userId');
            if(!this.isLogin()) {
                this.showDialog('login');
            } else {
                var token = Cookies.get('token');
                this.showLikeList(userId, token);
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
        }, this)).fail($.proxy(function(jqXHR, textStatus, errorThrown) {
            if(jqXHR.status === 422) {
                // 422 (Unprocessable Entity)
                this.showErr(this.ERR.AJAX.EXISTED, 'signup');
            } else {
                this.showErr(this.ERR.AJAX.OTHERS, 'signup');
            }
        }, this));
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
            this.update(response, true);
        }, this)).fail($.proxy(function(jqXHR, textStatus, errorThrown) {
            if(jqXHR.status === 401) {
                // 401 (Unauthorized).
                this.showErr(this.ERR.AJAX.UNAUTHORIZED, 'login');
            } else {
                this.showErr(this.ERR.AJAX.OTHERS, 'login');
            }
        }, this));
    },

    facebookLogin: function() {
        // Login to user's Facebook and get access token.
        FB.login($.proxy(function(fbResponse) {
            if(fbResponse['authResponse']) {
                // Use the returned access token to login our service.
                var accessToken = FB.getAuthResponse()['accessToken'];
                $.ajax({
                    url: TOPPANO.gv.apiUrl + '/users/auth/facebook/token?access_token=' + accessToken,
                    type: 'GET'
                }).done($.proxy(function(response) {
                    this.update(response, false);
                }, this)).fail(function(jqXHR, textStatus, errorThrown) {
                    // TODO: Error handling.
                });
            } else {
                // TODO: Hnadle response['authResponse'] is not defined.
            }
        }, this), { scope: 'public_profile,email,publish_actions,user_likes' });
    },

    // Update informatin after login successfully.
    update: function(response, usedEmail) {
        var userId, token;

        if(usedEmail) {
            userId = response.userId;
            token = response.id;
        } else {
            // Use Facebook login.
            userId = response.auth.userId;
            token = response.auth.id;
        }
        expires = new Date(response.created);

        expires.setSeconds(expires.getSeconds() + response.ttl);
        Cookies.set('userId', userId, { expires: expires });
        Cookies.set('token', token, { expires: expires });
        this.hideDialog();
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

    // Show people who like this post.
    showLikeList: function(userId, token) {
        TOPPANO.ui.utils.openDialog({
            items: {
                src: '#likelist',
                type: 'inline'
            },
            showCloseBtn: false
        });
    },

    isLogin: function() {
        return Cookies.get('token') && Cookies.get('userId');
    },

    isValidEmail: function(email) {
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return pattern.test(email);
    },

    showErr: function(errMsg, backDialog) {
        var errDialog = $('#account-err');

        $('.account-text', errDialog).html(errMsg);
        $('.account-btn', errDialog).off().on('click', $.proxy(function() {
            this.showDialog(backDialog);
        }, this));
        this.showDialog('err');
    },

    showDialog: function(dialog) {
        var options = {
            items: {
                src: '#account-' + dialog,
                type: 'inline'
            },
            showCloseBtn: false
        };

        $('#account-' + dialog + ' input[type="password"]').val('');
        if(!TOPPANO.ui.utils.isDialogOpened()) {
            TOPPANO.ui.utils.openDialog(options);
        } else {
            this.hideDialog();
            // TODO: Use setTimeout is not the stablest method, please fix it.
            setTimeout(function() {
                TOPPANO.ui.utils.openDialog(options);
            }, 50);
        }
    },

    hideDialog: function() {
        TOPPANO.ui.utils.closeDialog();
    },

    checkSignupInput: function(username, email, password) {
        if(!username) {
            // Username is empty string.
            this.showErr(this.ERR.USERNAME.EMPTY, 'signup');
            return false;
        } else if(!email) {
            // Email is empty string.
            this.showErr(this.ERR.EMAIL.EMPTY, 'signup');
            return false;
        } else if(!password) {
            // Password is empty string.
            this.showErr(this.ERR.PASSWORD.EMPTY, 'signup');
            return false;
        } else if(!this.isValidEmail(email)) {
            // Invalid Email.
            this.showErr(this.ERR.EMAIL.INVALID, 'signup');
            return false;
        }
        return true;
    },

    checkLoginInput: function(email, password) {
        if(!email) {
            // Email is empty string.
            this.showErr(this.ERR.EMAIL.EMPTY, 'login');
            return false;
        } else if(!password) {
            // Password is empty string.
            this.showErr(this.ERR.PASSWORD.EMPTY, 'login');
            return false;
        } else if(!this.isValidEmail(email)) {
            // Invalid Email.
            this.showErr(this.ERR.EMAIL.INVALID, 'login');
            return false;
        }
        return true;
    },

    setUsername: function(userId, token) {
        var url = TOPPANO.gv.apiUrl + '/users/' + userId  + '?access_token=' + token;
        
        $.ajax({
            url: url,
            type: 'GET'
        }).done(function(response) {
            $('#logo-bar .logobar-username').html(response.username);
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
    },

    ERR: {
        USERNAME: {
            EMPTY: 'Please enter your name.'
        },
        EMAIL: {
            EMPTY: 'Please enter your email.',
            INVALID: 'The email address is not valid.<br />Please try another address.',
        },
        PASSWORD: {
            EMPTY: 'Please enter your password.'
        },
        AJAX: {
            EXISTED: 'The email address already exists.<br />Please try another address.',
            UNAUTHORIZED: 'The email and password don\'t match.<br />Please enter again.',
            OTHERS: 'Something wrong with server.<br />Please try again later.'
        }
    }
};

