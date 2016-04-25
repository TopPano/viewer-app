TOPPANO.devices = TOPPANO.devices || {
    isIOS: function() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },

    isIFrame: function() {
        return window != window.top;
    }
}

