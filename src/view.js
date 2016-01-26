/**
 * Toppano Panorama Viewer API
 * View Function
 */

// update url: #fov,lat,lon,panoID
TOPPANO.URL = function() {
    // initialization
    if (!isNaN(TOPPANO.gv.urlHash)) {
        TOPPANO.gv.cam.lon = -30;
        TOPPANO.gv.cam.lat = 0;
    } else {
        var urlHash = TOPPANO.gv.urlHash.slice(1, TOPPANO.gv.urlHash.length)
        var urlHashArray = urlHash.split(',');
        if (urlHashArray.length === 4) {
            isNaN(urlHashArray[0]) ? TOPPANO.gv.cam.defaultCamFOV = 75
            : TOPPANO.gv.cam.defaultCamFOV = clamp(parseInt(urlHashArray[0]), TOPPANO.gv.para.fov.min, TOPPANO.gv.para.fov.max);

            isNaN(urlHashArray[1]) ? TOPPANO.gv.cam.lat = 0
            : TOPPANO.gv.cam.lat = parseInt(urlHashArray[1]);

            isNaN(urlHashArray[2]) ? TOPPANO.gv.cam.lon = 0
            : TOPPANO.gv.cam.lon = parseInt(urlHashArray[2]);

            isNaN(urlHashArray[3]) ? TOPPANO.gv.cam.panoID = 0
            : TOPPANO.gv.cam.panoID = parseInt(urlHashArray[3]);

            if (isEmpty(urlHashArray[0])) {
                TOPPANO.gv.cam.defaultCamFOV = 75;
            }
            if (isEmpty(urlHashArray[1])) {
                TOPPANO.gv.cam.lat = 0;
            }
            if (isEmpty(urlHashArray[2])) {
                TOPPANO.gv.cam.lon = 0;
            }
            if (isEmpty(urlHashArray[3])) {
                TOPPANO.gv.cam.panoID = 0;
            }
            window.location.hash = TOPPANO.gv.cam.defaultCamFOV + ',' + TOPPANO.gv.cam.lat + ',' + TOPPANO.gv.cam.lon + ',' + TOPPANO.gv.cam.panoID;
        }
    }
};

TOPPANO.URL.prototype = {
    update: function() {
        window.location.hash = TOPPANO.gv.cam.fov + ',' + TOPPANO.gv.cam.lat + ',' + TOPPANO.gv.cam.lon + ',' + TOPPANO.gv.cam.panoID;
    },

    toUrlValue: function() {
        return TOPPANO.gv.cam.fov + ',' + TOPPANO.gv.cam.lon + ',' + TOPPANO.gv.cam.lon + ',' + TOPPANO.gv.cam.panoID;
    }
};

// drawing snapshot canvas
TOPPANO.drawCanvas = function() {
    var snapshotCanvas = document.createElement('canvas');
    snapshotCanvas.id = 'myCanvas';
    snapshotCanvas.setAttribute('style', 'position: absolute; left: 50%; top:10%; width:"1500px"; height:"1500px";');
    document.body.appendChild(snapshotCanvas);
    TOPPANO.gv.canvas = document.getElementById('myCanvas');
    var canvas = TOPPANO.gv.canvas,
    context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    canvas.style.position = "fixed";
    canvas.style.left = "10%";
    canvas.height = window.innerHeight * 0.8;
    canvas.width = window.innerWidth * 0.8;

    var rectPos = {
    	x: 10,
    	y: 10,
    	width: window.innerWidth * 0.8 - 14,
    	height: window.innerHeight * 0.8 - 14
    },
    rectStyle = {
    	lineWidth: 7,
    	color: {
    		r: 255,
    		g: 255,
    		b: 255,
    		a: 0.6
    	}
    },
    crossPos = {
    	centerX: window.innerWidth * 0.4 + 10,
    	centerY: window.innerHeight * 0.4 + 10,
    	width: 60,
    	height: 60
    },
    crossStyle = {
    	lineWidth: 7,
    	color: {
    		r: 255,
    		g: 255,
    		b: 255,
    		a: 0.6
    	}
    };

    drawRect(canvas, rectPos, rectStyle);
    drawCross(canvas, crossPos, crossStyle);
};

function drawRect(canvas, pos, style) {
	var context = canvas.getContext('2d');
	context.beginPath();
    context.rect(pos.x, pos.y, pos.width, pos.height);
    context.lineWidth = style.lineWidth;
    context.strokeStyle = 'rgba(' + style.color.r +', ' + style.color.g + ', ' + style.color.b + ', ' + style.color.a + ')';
    context.stroke();
}

function drawCross(canvas, pos, style) {
	var context = canvas.getContext('2d');
	context.beginPath();
    context.moveTo(pos.centerX - 0.5 * pos.width, pos.centerY);
    context.lineTo(pos.centerX + 0.5 * pos.height, pos.centerY);
    context.moveTo(pos.centerX, pos.centerY - 0.5 * pos.width);
    context.lineTo(pos.centerX, pos.centerY + 0.5 * pos.height);
    context.lineWidth = style.lineWidth;
    context.strokeStyle = 'rgba(' + style.color.r +', ' + style.color.g + ', ' + style.color.b + ', ' + style.color.a + ')';
    context.stroke();
}

function fadeIn(obj, ms) {
    show(obj);
	var speed = 20,
	delay = ms / speed,
	opaDelta = speed / ms;

	var opacity = 0;
	obj.style.opacity = opacity;
	var fading = window.setInterval(function() {
		opacity += opaDelta;
	    obj.style.opacity = opacity;
	    if(obj.style.opacity >= 1) {
	      window.clearInterval(fading);
	      obj.style.opacity = 1;
	    }
	}, speed);
}

function fadeOut(obj, ms) {
	var speed = 20,
	delay = ms / speed,
	opaDelta = speed / ms;

	var opacity = 1;
	obj.style.opacity = opacity;
	var fading = window.setInterval(function() {
		opacity -= opaDelta;
	    obj.style.opacity = opacity;
	    if(obj.style.opacity <= 0) {
	      window.clearInterval(fading);
	      obj.style.opacity = 0;
          hide(obj);
	    }
	}, speed);
}

function hide(obj) {
    obj.style.visibility = 'hidden';
    obj.style.opacity = 0;
}

function show(obj) {
    obj.style.visibility = 'visible';
}
