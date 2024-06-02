import * as amqp from "amqplib";
import {
  consumeMessage,
  getRandomExamType,
  getRandomName,
  getRandomSeconds,
  log,
  sendMessage,
} from "./utils";

const args = process.argv.slice(2);
const name = args[0] ?? "Dr.Who";

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "examination_request";
  channel.assertExchange(exchange, "direct", { durable: true });

  const queue = "examination_response";
  const q = await channel.assertQueue(queue, { exclusive: false });
  channel.bindQueue(q.queue, exchange, queue);

  const correlationIds: Set<string> = new Set();
  consumeMessage(channel, q, (msg) => {
    if (correlationIds.has(msg.properties.correlationId)) {
      processMessage(channel, msg);
      correlationIds.delete(msg.properties.correlationId);
    }
  });

  setInterval(() => {
    correlationIds.add(
      requestExamination(channel, getRandomExamType(), getRandomName()),
    );
  }, getRandomSeconds());
})();

function processMessage(channel: amqp.Channel, msg: amqp.ConsumeMessage) {
  log(name, `I just got results: ${msg.content.toString()}`);
  channel.ack(msg);
}

function requestExamination(
  channel: amqp.Channel,
  examination_type: string,
  examination_content: string,
) {
  const correlationId = sendMessage(
    channel,
    "examination_request",
    examination_type,
    examination_content,
  );
  log(
    name,
    `I need ${examination_type} examination for ${examination_content}! Case number: ${correlationId}`,
  );
  return correlationId;
}
