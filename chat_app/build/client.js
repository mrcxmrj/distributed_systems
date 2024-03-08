"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const node_process_1 = __importDefault(require("node:process"));
const node_readline_1 = __importDefault(require("node:readline"));
const rl = node_readline_1.default.createInterface({
    input: node_process_1.default.stdin,
    output: node_process_1.default.stdin,
});
const ADDRESS = "127.0.0.1";
const PORT = 9000;
const DEFAULT_PROMPT = "CHAT> ";
let username = "";
const client = new net_1.default.Socket();
client.connect(PORT, ADDRESS, () => {
    console.log("Connected to server");
});
client.on("data", (data) => {
    console.log("Received: " + data);
});
client.on("close", () => {
    console.log("Connection closed");
});
rl.question("What's your name? ", (name) => {
    rl.setPrompt(`${name}> `);
    username = name;
    rl.prompt();
});
rl.on("line", (message) => {
    const messageLog = {
        user: username,
        timestamp: new Date(),
        message: message,
    };
    client.write(JSON.stringify(messageLog));
    rl.prompt();
}).on("close", () => {
    rl.setPrompt(DEFAULT_PROMPT);
    rl.prompt();
    console.log("Closing chat");
    node_process_1.default.exit(0);
});
