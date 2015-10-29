var express = require('express'),
    path = require('path'),
    http = require('http');

var app = express(),
    server = http.createServer(app);

app.use(express.static(path.join(__dirname)));

server.listen(3001);
console.log('Server starting at port: '+3001);
