"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const node_process_1 = __importDefault(require("node:process"));
const node_readline_1 = __importDefault(require("node:readline"));
const node_dgram_1 = __importDefault(require("node:dgram"));
const rl = node_readline_1.default.createInterface({
    input: node_process_1.default.stdin,
    output: node_process_1.default.stdin,
});
const ADDRESS = "127.0.0.1";
const PORT = 9000;
const CHATBOT_HANDLE = "CHAT";
let username = "";
const tcpSocket = new net_1.default.Socket();
const udpSocket = node_dgram_1.default.createSocket("udp4");
tcpSocket.connect(PORT, ADDRESS, () => {
    setupTcpListeners();
    udpSocket.connect(PORT, ADDRESS, () => {
        setupUdpListeners();
        mainLoop();
    });
});
function setupTcpListeners() {
    tcpSocket.on("data", (data) => {
        const decodedData = JSON.parse(data.toString());
        systemMessage(decodedData.message, decodedData.user);
    });
    tcpSocket.on("close", () => {
        systemMessage("Disconnected from the server");
    });
}
function setupUdpListeners() { }
function mainLoop() {
    systemMessage("Connected to the server");
    rl.question(`${formatMessage(new Date(), CHATBOT_HANDLE, "What's your name?")}\n${formatMessage(new Date(), "guest", "")}`, (name) => {
        rl.setPrompt(`${name}> `);
        username = name;
        promptUserMessage();
    });
    rl.on("line", (message) => {
        const messageLog = {
            user: username,
            timestamp: new Date(),
            message: message,
        };
        promptUserMessage();
        tcpSocket.write(JSON.stringify(messageLog));
    }).on("close", () => {
        systemMessage("Goodbye");
        node_process_1.default.exit(0);
    });
}
const formatMessage = (timestamp, username, message) => `[${timestamp.toLocaleTimeString()}] ${username}> ${message}`;
function systemMessage(message, username = CHATBOT_HANDLE) {
    node_readline_1.default.moveCursor(node_process_1.default.stdout, 0, -1);
    node_readline_1.default.clearLine(node_process_1.default.stdout, 1);
    console.log(`\n${formatMessage(new Date(), username, message)}`);
    promptUserMessage();
}
function promptUserMessage() {
    rl.setPrompt(formatMessage(new Date(), username, ""));
    rl.prompt();
}
