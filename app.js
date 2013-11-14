var html = require('fs').readFileSync(__dirname+'/app.html');
var app = require('http').createServer(function(req, res){ res.end(html); });
app.listen(8080);
var io = require("socket.io");
var io = io.listen(app);
io.sockets.on('connection', function (socket) {
    socket.emit('faitUneAlerte');
});

/*
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Oh cela marche !!!\n');
}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');
*/