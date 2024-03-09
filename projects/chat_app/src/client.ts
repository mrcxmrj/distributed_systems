import net from "net";
import process from "node:process";
import readline from "node:readline";
import dgram from "node:dgram";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdin,
});

const monkaS = `⣿⣿⣿⣿⣿⣿⣿⠿⢛⢛⡛⡻⢿⣿⣿⣿⣿⠟⠛⢛⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿
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

const tcpSocket = new net.Socket();
const udpSocket = dgram.createSocket("udp4");
tcpSocket.connect(PORT, ADDRESS, () => {
    setupTcpListeners();
    udpSocket.connect(PORT, ADDRESS, () => {
        setupUdpListeners();
        mainLoop();
    });
});

function setupTcpListeners() {
    tcpSocket.on("data", (data) => {
        const decodedData: MessageLog = JSON.parse(data.toString());
        systemMessage(decodedData.message, decodedData.user);
    });

    tcpSocket.on("close", () => {
        systemMessage("Disconnected from the server");
    });
}

function setupUdpListeners() {}

function mainLoop() {
    systemMessage("Connected to the server");
    rl.question(
        `${formatMessage(
            new Date(),
            CHATBOT_HANDLE,
            "What's your name?"
        )}\n${formatMessage(new Date(), "guest", "")}`,
        (name) => {
            rl.setPrompt(`${name}> `);
            username = name;
            promptUserMessage();
        }
    );
    rl.on("line", (message) => {
        switch (message) {
            case "U":
                udpSocket.send(monkaS);
                break;
            default:
                const messageLog: MessageLog = {
                    user: username,
                    timestamp: new Date(),
                    message: message,
                };
                tcpSocket.write(JSON.stringify(messageLog));
                break;
        }

        promptUserMessage();
    }).on("close", () => {
        systemMessage("Goodbye");
        process.exit(0);
    });
}

const formatMessage = (timestamp: Date, username: string, message: string) =>
    `[${timestamp.toLocaleTimeString()}] ${username}> ${message}`;

function systemMessage(message: string, username: string = CHATBOT_HANDLE) {
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 1);
    console.log(`\n${formatMessage(new Date(), username, message)}`);
    promptUserMessage();
}

function promptUserMessage() {
    rl.setPrompt(formatMessage(new Date(), username, ""));
    rl.prompt();
}
