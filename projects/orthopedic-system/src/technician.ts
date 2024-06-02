import * as amqp from "amqplib";
import { consumeMessage, getRandomBoolean, sendMessage } from "./utils";

const proficiencies = process.argv.slice(2);

if (proficiencies.length != 2) {
  console.log("Usage: technician.js [proficiency_1] [proficiency_2]");
  process.exit(1);
}

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "examination_request";
  channel.assertExchange(exchange, "direct", { durable: true });
  proficiencies.forEach(async (proficiency) => {
    const q = await channel.assertQueue(proficiency, { exclusive: false });

    console.log(
      " [*] Waiting for messages in %s. To exit press CTRL+C",
      q.queue,
    );
    channel.bindQueue(q.queue, exchange, proficiency);

    consumeMessage(channel, q, (msg) => {
      processMessage(channel, msg);
      const patientStatus = getRandomBoolean() ? "stable" : "in rough shape";
      const responseContent = `Results for ${msg.fields.routingKey}/${msg.properties.correlationId}/'${msg.content.toString()}': patient is ${patientStatus}`;
      sendMessage(
        channel,
        exchange,
        "examination_response",
        responseContent,
        msg.properties.correlationId,
      );
    });
  });
})();

function processMessage(channel: amqp.Channel, msg: amqp.ConsumeMessage) {
  console.log(
    ` [x] Processing ${msg.fields.routingKey}: '${msg.content.toString()}'`,
  );
  setTimeout(() => {
    console.log(" [x] Done");
    channel.ack(msg);
  }, 3000);
}
