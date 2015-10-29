/**
 * Toppano Panorama Viewer API
 * Class
 */

// LatLng
TOPPANO.LatLng = function(latitude, longitude) {
	this.lat = latitude;
	this.lng = longitude;
};

TOPPANO.LatLng.prototype = {
	constructor: TOPPANO.LatLng,

	equals: function(lat2, lng2) {
		if ( Math.abs(this.lat - lat2) + Math.abs(this.lng - lng2) < TOPPANO.gv.para.epsilon )
			return true;
		return false;
	},

	toString: function() {
		return 'lat: ' + this.lat.toString() + ', lng: ' + this.lng.toString();
	},

	toUrlValue: function() {
		return this.lat.toString() + ',' + this.lng.toString();
	}
};

// Size
TOPPANO.Size = function(w, h) {
	this.width = w;
	this.height = h;
};

TOPPANO.Size.prototype = {
	constructor: TOPPANO.Size,

	equals: function(w2, h2) {
		if ( Math.abs(this.width - w2) + Math.abs(this.height - h2) < TOPPANO.gv.para.epsilon )
			return true;
		return false;
	},

	toString: function() {
		return 'width: ' + this.width.toString() + ', height: ' + this.height.toString();
	}
};

// Toppano panorama information
TOPPANO.Panorama = function(info) {
	this.panoID = Math.floor( Math.random() * 1000000 ); // NOW: randomly generate a 6-digi ID
	this.position = new TOPPANO.LatLng(info.lat, info.lng);
	this.locationInfo = info.locationInfo || 'Toppano, Taipei, Taiwan.';
	this.visible = info.visible;
	this.fov = info.fov || TOPPANO.gv.cam.defaultCamFOV;
};

TOPPANO.Panorama.prototype = {
	constructor: TOPPANO.Panorama,

	// getLinks: function() {

	// },

	getLocation: function() {
		return this.locationInfo;
	},

	getPano: function() {
		return this.panoID;
	},

	// getPhotographerPov: function() {
	// 	return;
	// },

	getPosition: function() {
		return this.position;
	},

	// getPov: function() {
	// 	return;
	// },

	getVisible: function() {
		return this.visible;
	},

	getZoom: function() {
		return this.fov;
	},

	// setLinks: function(links) {

	// },

	setPano: function(newPanoID) {
		this.panoID = newPanoID;
	},

	setPosition: function(newLat, newLng) {
		this.position(newLat, newLng);
	},

	// setPov: function() {
	// 	this.
	// },

	setVisible: function(newVisible) {
		this.visible = newVisible;
	},

	setZoom: function(newFOV) {
		this.fov = newFOV;
	}

};

