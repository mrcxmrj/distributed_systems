"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const address = "127.0.0.1";
const port = 9000;
const connections = [];
const server = net_1.default.createServer();
server.listen(port, address, () => console.log(`Server is listening on port ${port}`));
server.on("connection", (socket) => {
    socket.on("data", (data) => handleConnection(data, socket));
    connections.push(socket);
    // connections.forEach((socket) => console.log(socket.remotePort));
});
server.on("close", () => console.log("Closing server"));
function handleConnection(data, socket) {
    console.log("--------------------------------------------");
    console.log(`New connnection from ${socket.remoteAddress}`);
    const bytesRead = socket.bytesRead;
    const bytesWritten = socket.bytesWritten;
    console.log(`Bytes read: ${bytesRead}`);
    console.log(`Bytes written: ${bytesWritten}`);
    console.log(`Message received: ${data}`);
    console.log("--------------------------------------------");
}
