import net from "net";
import process from "node:process";
import readline from "node:readline";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdin,
});

const address = "127.0.0.1";
const port = 9000;
let username = "";

const client = new net.Socket();
client.connect(port, address, () => {
    client.write(process.argv[2] ?? "Nothing to send");
});

client.on("data", (data) => {
    console.log("Received: " + data);
    client.destroy(); // kill client after server's response
});

client.on("close", () => {
    console.log("Connection closed");
});

rl.question("What's your name? ", (name) => {
    rl.setPrompt(`${name}>`);
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
    console.log("Closing chat");
    process.exit(0);
});
