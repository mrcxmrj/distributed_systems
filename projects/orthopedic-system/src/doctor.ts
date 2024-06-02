import * as amqp from "amqplib/callback_api";

const args = process.argv.slice(2);

if (args.length != 2) {
  console.log("Usage: doctor.js [examination_type] [examination_content]");
  process.exit(1);
}
const [examination_type, examination_content] = args;

amqp.connect("amqp://localhost", (error, connection) => {
  if (error) {
    console.error(error);
  }
  connection.createChannel((error, channel) => {
    if (error) {
      console.error(error);
    }

    const exchange = "examination_request";
    const msg = examination_content;
    const routingKey = examination_type;

    channel.assertExchange(exchange, "direct", { durable: false });
    channel.publish(exchange, routingKey, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });
  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 500);
});
