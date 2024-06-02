import * as amqp from "amqplib";
import {
  consumeMessage,
  getRandomBoolean,
  getRandomExamType,
  getRandomSeconds,
  log,
  sendMessage,
} from "./utils";

const args = process.argv.slice(2);

const name = args[0] ?? "Dexter";
const proficiency1 = args[1] ?? getRandomExamType();
const proficiency2 = args[2] ?? getRandomExamType();

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "examination_request";
  channel.assertExchange(exchange, "direct", { durable: true });
  [proficiency1, proficiency2].forEach(async (proficiency) => {
    const q = await channel.assertQueue(proficiency, { exclusive: false });

    log(name, `Waiting for messages in ${q.queue}. To exit press CTRL+C`);
    channel.bindQueue(q.queue, exchange, proficiency);

    consumeMessage(channel, q, (msg) => {
      processMessage(channel, msg);
      const patientStatus = getRandomBoolean() ? "stable" : "in rough shape";
      const responseContent = `${getCaseNumber(msg)}: patient is ${patientStatus}`;
      sendMessage(
        channel,
        exchange,
        "examination_response",
        responseContent,
        msg.properties.correlationId,
      );
      log(name, responseContent);
    });
  });
})();

function processMessage(channel: amqp.Channel, msg: amqp.ConsumeMessage) {
  log(name, `Processing ${getCaseNumber(msg)}`);
  setTimeout(() => {
    log(name, `Done processing ${getCaseNumber(msg)}`);
    channel.ack(msg);
  }, getRandomSeconds());
}

const getCaseNumber = (msg: amqp.ConsumeMessage) =>
  `${msg.properties.correlationId}/${msg.fields.routingKey}/${msg.content.toString()}`;
