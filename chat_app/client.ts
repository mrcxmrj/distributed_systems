import net from "net";
import process from "node:process";
import readline from "node:readline";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdin,
});

const ADDRESS = "127.0.0.1";
const PORT = 9000;
const DEFAULT_PROMPT = "CHAT> ";
let username = "";

const client = new net.Socket();
client.connect(PORT, ADDRESS, () => {
    client.write(process.argv[2] ?? "Nothing to send");
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
    process.exit(0);
});
