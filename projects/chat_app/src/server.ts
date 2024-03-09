import net from "net";
import dgram from "node:dgram";

const address = "127.0.0.1";
const port = 9000;
const connections: Set<net.Socket> = new Set();
const udpConnections: Set<dgram.Socket> = new Set(); // do we even store udp connections?
const chatLog: ChatLog = []; // this should probably be a queue?

const server = net.createServer();
server.listen(port, address, () =>
    console.log(`Server is listening on port ${port}`)
);

server.on("connection", (socket: net.Socket) => {
    socket.on("data", (data) => handleIncomingMessage(data, socket));
    socket.on("close", () => connections.delete(socket));
    connections.add(socket);

    const udpSocket = dgram.createSocket("udp4");
    udpSocket.on("message", handleIncomingImage());
});
server.on("close", () => console.log("Closing server"));

function handleIncomingMessage(data: Buffer, socket: net.Socket) {
    const decodedData = data.toString("utf-8");
    const messageLog: MessageLog = JSON.parse(decodedData);
    chatLog.push(messageLog);
    console.log(chatLog);
    connections.forEach((connection) => {
        if (connection.remotePort !== socket.remotePort) connection.write(data);
    });
}
