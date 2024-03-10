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
const monkaS = `
⣿⣿⣿⣿⣿⣿⣿⠿⢛⢛⡛⡻⢿⣿⣿⣿⣿⠟⠛⢛⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⢟⢱⡔⡝⣜⣜⢜⢜⡲⡬⡉⢕⢆⢏⢎⢇⢇⣧⡉⠿⣿⣿⣿⣿⣿⣿
⣿⣿⡟⡱⣸⠸⢝⢅⢆⢖⣜⣲⣵⣴⣱⣈⡣⣋⢣⠭⣢⣒⣬⣕⣄⣝⡻⢿⣿⣿
⣿⠟⡜⣎⢎⢇⢇⣵⣷⣿⣿⡿⠛⠉⠉⠛⢿⣦⢵⣷⣿⣿⣿⠟⠛⠋⠓⢲⡝⣿
⢏⢰⢱⣞⢜⢵⣿⣿⣿⣿⣿⠁⠐⠄⠄⠄⠄⢹⣻⣿⣿⣿⠡⠄⠄⠄⠄⠄⠹⣺
⢕⢜⢕⢕⢵⠹⢿⣿⣿⣿⣿⡀⠸⠗⣀⠄⠄⣼⣻⣿⣿⣿⡀⢾⠆⣀⠄⠄⣰⢳
⡕⣝⢜⡕⣕⢝⣜⢙⢿⣿⣿⣷⣦⣤⣥⣤⣾⢟⠸⢿⣿⣿⣿⣦⣄⣉⣤⡴⢫⣾
⡪⡪⣪⢪⢎⢮⢪⡪⡲⢬⢩⢩⢩⠩⢍⡪⢔⢆⢏⡒⠮⠭⡙⡙⠭⢝⣨⣶⣿⣿
⡪⡪⡎⡮⡪⡎⡮⡪⣪⢣⢳⢱⢪⢝⢜⢜⢕⢝⢜⢎⢧⢸⢱⡹⡍⡆⢿⣿⣿⣿
⡪⡺⡸⡪⡺⣸⠪⠚⡘⠊⠓⠕⢧⢳⢹⡸⣱⢹⡸⡱⡱⡕⡵⡱⡕⣝⠜⢿⣿⣿
⡪⡺⡸⡪⡺⢐⢪⢑⢈⢁⢋⢊⠆⠲⠰⠬⡨⡡⣁⣉⠨⡈⡌⢥⢱⠐⢕⣼⣿⣿
⡪⣪⢣⢫⠪⢢⢅⢥⢡⢅⢅⣑⡨⡑⠅⠕⠔⠔⠄⠤⢨⠠⡰⠠⡂⣎⣼⣿⣿⣿
⠪⣪⡪⡣⡫⡢⡣⡣⡣⡣⡣⣣⢪⡪⡣⡣⡲⣑⡒⡎⡖⢒⣢⣥⣶⣿⣿⣿⣿⣿
⢁⢂⠲⠬⠩⣁⣙⢊⡓⠝⠎⠮⠮⠚⢎⡣⡳⠕⡉⣬⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿
⢐⠐⢌⠐⠅⡂⠄⠄⢌⢉⠩⠡⡉⠍⠄⢄⠢⡁⡢⠠⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿`;
const ADDRESS = "127.0.0.1";
const PORT = 9000;
const CHATBOT_HANDLE = "CHAT";
let username = "";
const tcpSocket = new net_1.default.Socket();
const udpSocket = node_dgram_1.default.createSocket("udp4");
tcpSocket.connect(PORT, ADDRESS, () => {
    setupTcpListeners();
    printMessage("Connected the texting server");
    udpSocket.connect(PORT, ADDRESS, () => {
        setupUdpListeners();
        printMessage("Connected the image transfer server");
        udpSocket.send("HELLO");
        mainLoop();
    });
});
function setupTcpListeners() {
    tcpSocket.on("data", (data) => {
        const decodedData = JSON.parse(data.toString());
        printMessage(decodedData.message, decodedData.user);
    });
    tcpSocket.on("close", () => {
        printMessage("Disconnected from the texting server");
    });
}
function setupUdpListeners() {
    udpSocket.on("message", (message) => {
        const decodedMessage = JSON.parse(message.toString());
        printMessage(decodedMessage.message, decodedMessage.user);
    });
    tcpSocket.on("close", () => {
        printMessage("Disconnected from the image transfer server");
    });
}
function mainLoop() {
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
        switch (message) {
            case "U":
                node_readline_1.default.moveCursor(node_process_1.default.stdout, 0, -1);
                clearLine();
                printMessage(monkaS, username);
                messageLog.message = monkaS;
                udpSocket.send(JSON.stringify(messageLog));
                break;
            default:
                tcpSocket.write(JSON.stringify(messageLog));
                promptUserMessage();
                break;
        }
    }).on("close", () => {
        node_process_1.default.exit(0);
    });
}
const formatMessage = (timestamp, username, message) => `[${timestamp.toLocaleTimeString()}] ${username}> ${message}`;
const clearLine = () => {
    node_readline_1.default.clearLine(node_process_1.default.stdout, 0);
    node_readline_1.default.cursorTo(node_process_1.default.stdout, 0);
};
function printMessage(message, username = CHATBOT_HANDLE) {
    clearLine();
    console.log(`${formatMessage(new Date(), username, message)}`);
    promptUserMessage();
}
function promptUserMessage() {
    rl.setPrompt(formatMessage(new Date(), username, ""));
    rl.prompt();
}
