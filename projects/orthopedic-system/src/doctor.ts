import * as amqp from "amqplib";
import { consumeMessage, sendMessage } from "./utils";

const args = process.argv.slice(2);

if (args.length != 2) {
  console.log("Usage: doctor.js [examination_type] [examination_content]");
  process.exit(1);
}
const [examination_type, examination_content] = args;

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const correlationId = sendMessage(
    channel,
    "examination_request",
    examination_type,
    examination_content,
  );

  const exchange = "examination_request";
  channel.assertExchange(exchange, "direct", { durable: true });

  const queue = "examination_response";
  const q = await channel.assertQueue(queue, { exclusive: false });

  console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
  channel.bindQueue(q.queue, exchange, queue);

  consumeMessage(channel, q, (msg) => {
    if (msg.properties.correlationId === correlationId)
      processMessage(channel, msg);
  });
})();

function processMessage(channel: amqp.Channel, msg: amqp.ConsumeMessage) {
  console.log(` [x] Response: '${msg.content.toString()}'`);
  channel.ack(msg);
  process.exit(0);
}
