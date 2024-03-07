"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
var address = "127.0.0.1";
var port = 9000;
var connections = [];
var server = net_1.default.createServer();
server.listen(port, address, function () {
    return console.log("Server is listening on port ".concat(port));
});
server.on("connection", function (socket) {
    socket.on("data", function (data) { return handleConnection(data, socket); });
    connections.push(socket);
    // connections.forEach((socket) => console.log(socket.remotePort));
});
server.on("close", function () { return console.log("Closing server"); });
function handleConnection(data, socket) {
    console.log("--------------------------------------------");
    console.log("New connnection from ".concat(socket.remoteAddress));
    var bytesRead = socket.bytesRead;
    var bytesWritten = socket.bytesWritten;
    console.log("Bytes read: ".concat(bytesRead));
    console.log("Bytes written: ".concat(bytesWritten));
    console.log("Message received: ".concat(data));
    console.log("--------------------------------------------");
}
