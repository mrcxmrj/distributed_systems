import net from "net";
import dgram from "node:dgram";

const ADDRESS = "127.0.0.1";
const PORT = 9000;
const tcpConnections: Set<net.Socket> = new Set();
const udpSockets: Set<UdpSocket> = new Set();
const chatLog: ChatLog = []; // this should probably be a queue?

const tcpServer = net.createServer();
tcpServer.listen(PORT, ADDRESS, () => {
    const udpSocket = dgram.createSocket("udp4");
    udpSocket.bind(PORT);
    udpSocket.on("message", (message, remoteInfo) =>
        handleUdpMessage(message, remoteInfo, udpSocket)
    );

    console.log(`Server is listening on port ${PORT}`);
});
tcpServer.on("connection", (socket: net.Socket) => {
    socket.on("data", (data) => handleTcpData(data, socket));
    socket.on("close", () => tcpConnections.delete(socket));
    tcpConnections.add(socket);
});
tcpServer.on("close", () => console.log("Closing server"));

function handleTcpData(data: Buffer, socket: net.Socket) {
    const decodedData = data.toString("utf-8");
    const messageLog: MessageLog = JSON.parse(decodedData);
    chatLog.push(messageLog);
    console.log(chatLog);
    tcpConnections.forEach((connection) => {
        if (connection.remotePort !== socket.remotePort) connection.write(data);
    });
}

function handleUdpMessage(
    message: Buffer,
    remoteInfo: dgram.RemoteInfo,
    localSocket: dgram.Socket
) {
    const remoteSocket: UdpSocket = {
        remoteAddress: remoteInfo.address,
        remotePort: remoteInfo.port,
    };
    const decodedMessage = message.toString("utf-8");
    if (decodedMessage === "HELLO") {
        udpSockets.add(remoteSocket);
        return;
    }

    const messageLog: MessageLog = JSON.parse(decodedMessage);
    chatLog.push(messageLog);
    console.log(chatLog);

    udpSockets.forEach((socket) => {
        if (JSON.stringify(socket) !== JSON.stringify(remoteSocket))
            localSocket.send(message, socket.remotePort, socket.remoteAddress);
    });
}
