import * as amqp from "amqplib";

const args = process.argv.slice(2);

if (args.length != 2) {
  console.log("Usage: doctor.js [examination_type] [examination_content]");
  process.exit(1);
}
const [examination_type, examination_content] = args;

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  sendMessage(
    channel,
    "examination_request",
    examination_type,
    examination_content,
  );

  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 500);
})();

function sendMessage(
  channel: amqp.Channel,
  exchange: string,
  routingKey: string,
  msg: string,
) {
  channel.assertExchange(exchange, "direct", { durable: true });
  channel.publish(exchange, routingKey, Buffer.from(msg), { persistent: true });
  console.log(" [x] Sent %s", msg);
}
