import net from "net";
const address = "127.0.0.1";
const port = 9000;
const connections: Set<net.Socket> = new Set();
const chatLog: ChatLog = []; // this should probably be a queue?

const server = net.createServer();
server.listen(port, address, () =>
    console.log(`Server is listening on port ${port}`)
);

server.on("connection", (socket: net.Socket) => {
    socket.on("data", (data) => handleIncomingMessage(data, socket));
    connections.add(socket);
    socket.on("close", () => connections.delete(socket));
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
