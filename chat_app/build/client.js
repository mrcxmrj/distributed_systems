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
    var _a;
    client.write((_a = node_process_1.default.argv[2]) !== null && _a !== void 0 ? _a : "Nothing to send");
});
client.on("data", (data) => {
    console.log("Received: " + data);
    client.destroy(); // kill client after server's response
});
client.on("close", () => {
    console.log("Connection closed");
});
rl.question(`${DEFAULT_PROMPT}What's your name? `, (name) => {
    rl.setPrompt(`${name}> `);
    username = name;
    rl.prompt();
});
rl.on("line", (message) => {
    const messageJSON = {
        user: username,
        message: message,
    };
    client.write(JSON.stringify(messageJSON));
    rl.prompt();
}).on("close", () => {
    rl.setPrompt(DEFAULT_PROMPT);
    rl.prompt();
    console.log("Closing chat");
    node_process_1.default.exit(0);
});
