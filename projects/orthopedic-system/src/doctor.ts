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

  const exchange = "examination_request";
  const msg = examination_content;
  const routingKey = examination_type;

  channel.assertExchange(exchange, "direct", { durable: false });
  channel.publish(exchange, routingKey, Buffer.from(msg));
  console.log(" [x] Sent %s", msg);
  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 500);
})();
