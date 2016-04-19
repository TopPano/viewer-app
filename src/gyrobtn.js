TOPPANO.ui.gyrobtn = TOPPANO.ui.gyro || {
    init: function() {
        TOPPANO.setGyro(TOPPANO.gyro.isOn);
        $('#gyro-btn').on('click', function(e) {
            $(this).toggleClass('gyrobtn-on');
            TOPPANO.gyro.isOn = !TOPPANO.gyro.isOn;
            TOPPANO.setGyro(TOPPANO.gyro.isOn);
        });
    },

    getHtml: function() {
        return '<div id="gyro-btn" class="gyrobtn gyrobtn-on"></div>';
    }
}

