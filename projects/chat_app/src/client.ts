import net from "net";
import process from "node:process";
import readline from "node:readline";
import dgram from "node:dgram";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdin,
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

const tcpSocket = new net.Socket();
const udpSocket = dgram.createSocket("udp4");
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
        const decodedData: MessageLog = JSON.parse(data.toString());
        printMessage(decodedData.message, decodedData.user);
    });

    tcpSocket.on("close", () => {
        printMessage("Disconnected from the texting server");
    });
}

function setupUdpListeners() {
    udpSocket.on("message", (message) => {
        const decodedMessage: MessageLog = JSON.parse(message.toString());
        printMessage(decodedMessage.message, decodedMessage.user);
    });

    tcpSocket.on("close", () => {
        printMessage("Disconnected from the image transfer server");
    });
}

function mainLoop() {
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
        const messageLog: MessageLog = {
            user: username,
            timestamp: new Date(),
            message: message,
        };

        switch (message) {
            case "U":
                readline.moveCursor(process.stdout, 0, -1);
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
        process.exit(0);
    });
}

const formatMessage = (timestamp: Date, username: string, message: string) =>
    `[${timestamp.toLocaleTimeString()}] ${username}> ${message}`;
const clearLine = () => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
};

function printMessage(message: string, username: string = CHATBOT_HANDLE) {
    clearLine();
    console.log(`${formatMessage(new Date(), username, message)}`);
    promptUserMessage();
}

function promptUserMessage() {
    rl.setPrompt(formatMessage(new Date(), username, ""));
    rl.prompt();
}
