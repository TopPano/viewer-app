var express = require('express'),
    dye = require('dye'),
    path = require('path'),
    http = require('http');

var app = express(),
    server = http.createServer(app);

app.use(express.static(path.join(__dirname)));

// Log request
app.use(function(req, res, next) {
    res.on('finish', function() {
        var method = res.statusCode < 400 ? dye.green(req.method) : dye.red(req.method);
        console.log('%s %s %d %d', dye.bold(method), req.originalUrl, res.statusCode, res._headers['content-length']);
    });
    res.on('error', function() {
        console.log('%s %s %d %s', req.method, req.originalUrl, res.statusCode, err);
    });
    return next();
});

var router = express.Router();
    testPhotoMeta = {
        "00000000": {
            "PanoID": "00000000",
            "imageServer": [],
            "heading": 0,
            "transition": [
                {
                    "lat": -17,
                    "lng": -60,
                    "size": 22,
                    "rotateX": 95,
                    "rotateY": 0,
                    "rotateZ": -100,
                    "objSphereRadius": 90,
                    "nextID": "00000001"
                }
            ]
        },
        "00000001": {
            "PanoID": "00000001",
            "imageServer": [],
            "heading": 280,
            "transition": [
                {
                    "lat": -15,
                    "lng": 32.7,
                    "size": 30,
                    "rotateX": 90,
                    "rotateY": 0,
                    "rotateZ": -65,
                    "objSphereRadius": 90,
                    "nextID": "00000000"
                },
                {
                    "lat": -10,
                    "lng": 274,
                    "size": 25,
                    "rotateX": 90,
                    "rotateY": 0,
                    "rotateZ": 189,
                    "objSphereRadius": 90,
                    "nextID": "00000002"
                }
            ]
        },
        "00000002": {
            "PanoID": "00000002",
            "imageServer": [],
            "heading": 275.8,
            "transition": [
                {
                    "lat": -16,
                    "lng": 78,
                    "size": 60,
                    "rotateX": 95,
                    "rotateY": 1,
                    "rotateZ": -25,
                    "objSphereRadius": 90,
                    "nextID": "00000001"
                },
                {
                    "lat": -20,
                    "lng": 268.9,
                    "size": 30,
                    "rotateX": 90,
                    "rotateY": 0,
                    "rotateZ": 180,
                    "objSphereRadius": 90,
                    "nextID": "00000003"
                }
            ]
        },
        "00000003": {
            "PanoID": "00000003",
            "imageServer": [],
            "heading": 270.3,
            "transition": [
                {
                    "lat": -20,
                    "lng": 85.7,
                    "size": 30,
                    "rotateX": 90,
                    "rotateY": 1,
                    "rotateZ": -10,
                    "objSphereRadius": 90,
                    "nextID": "00000002"
                }
            ]
        }
    };

router.get('/photometa', function(req, res) {
    var panoid = req.query.panoid;
    if (!panoid) {
        return res.status(400).send({error: 'Bad request'});
    }
    res.send(JSON.stringify(testPhotoMeta[panoid]));
});
app.use('/', router);

server.listen(3001);
console.log('Server starting at port: '+3001);
