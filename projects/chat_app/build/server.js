"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const node_dgram_1 = __importDefault(require("node:dgram"));
const ADDRESS = "127.0.0.1";
const PORT = 9000;
const tcpConnections = new Set();
const udpSockets = new Set();
const chatLog = []; // this should probably be a queue?
const tcpServer = net_1.default.createServer();
tcpServer.listen(PORT, ADDRESS, () => {
    const udpSocket = node_dgram_1.default.createSocket("udp4");
    udpSocket.bind(PORT);
    udpSocket.on("message", (message, remoteInfo) => handleUdpMessage(message, remoteInfo, udpSocket));
    console.log(`Server is listening on port ${PORT}`);
});
tcpServer.on("connection", (socket) => {
    socket.on("data", (data) => handleTcpData(data, socket));
    socket.on("close", () => tcpConnections.delete(socket));
    tcpConnections.add(socket);
});
tcpServer.on("close", () => console.log("Closing server"));
function handleTcpData(data, socket) {
    const decodedData = data.toString("utf-8");
    const messageLog = JSON.parse(decodedData);
    chatLog.push(messageLog);
    console.log(chatLog);
    tcpConnections.forEach((connection) => {
        if (connection.remotePort !== socket.remotePort)
            connection.write(data);
    });
}
function handleUdpMessage(message, remoteInfo, localSocket) {
    const remoteSocket = {
        remoteAddress: remoteInfo.address,
        remotePort: remoteInfo.port,
    };
    const decodedMessage = message.toString("utf-8");
    if (decodedMessage === "HELLO") {
        udpSockets.add(remoteSocket);
        return;
    }
    const messageLog = JSON.parse(decodedMessage);
    chatLog.push(messageLog);
    console.log(chatLog);
    udpSockets.forEach((socket) => {
        if (JSON.stringify(socket) !== JSON.stringify(remoteSocket))
            localSocket.send(message, socket.remotePort, socket.remoteAddress);
    });
}
