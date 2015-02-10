var chat = require('./chatServer.js');
var server = require('./httpServer.js');

chat.start();
server.start();

console.log("tadaa!");