"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const node_dgram_1 = __importDefault(require("node:dgram"));
const address = "127.0.0.1";
const port = 9000;
const connections = new Set();
const udpConnections = new Set(); // do we even store udp connections?
const chatLog = []; // this should probably be a queue?
const server = net_1.default.createServer();
server.listen(port, address, () => console.log(`Server is listening on port ${port}`));
server.on("connection", (socket) => {
    socket.on("data", (data) => handleIncomingMessage(data, socket));
    socket.on("close", () => connections.delete(socket));
    connections.add(socket);
    const udpSocket = node_dgram_1.default.createSocket("udp4");
    udpSocket.on("message", handleIncomingImage());
});
server.on("close", () => console.log("Closing server"));
function handleIncomingMessage(data, socket) {
    const decodedData = data.toString("utf-8");
    const messageLog = JSON.parse(decodedData);
    chatLog.push(messageLog);
    console.log(chatLog);
    connections.forEach((connection) => {
        if (connection.remotePort !== socket.remotePort)
            connection.write(data);
    });
}
