import net from "net";
import process from "node:process";
import readline from "node:readline";
import dgram from "node:dgram";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdin,
});

const ADDRESS = "127.0.0.1";
const PORT = 9000;
const CHATBOT_HANDLE = "CHAT";
let username = "";

const client = new net.Socket();
client.connect(PORT, ADDRESS, () => {
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
});

client.on("data", (data) => {
    const decodedData: MessageLog = JSON.parse(data.toString());
    systemMessage(decodedData.message, decodedData.user);
});

client.on("close", () => {
    systemMessage("Disconnected from the server");
});

rl.on("line", (message) => {
    const messageLog: MessageLog = {
        user: username,
        timestamp: new Date(),
        message: message,
    };
    promptUserMessage();
    client.write(JSON.stringify(messageLog));
}).on("close", () => {
    systemMessage("Goodbye");
    process.exit(0);
});

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
