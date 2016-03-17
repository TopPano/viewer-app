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
app.use('/', router);

server.listen(3001);
console.log('Server starting at port: '+3001);
