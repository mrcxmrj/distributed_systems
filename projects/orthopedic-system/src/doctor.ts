import * as amqp from "amqplib/callback_api";

const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: doctor.js [examination_type] [examination_content]");
  process.exit(1);
}

amqp.connect("amqp://localhost", (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }

    const exchange = "examination_request";
    const args = process.argv.slice(2);
    const msg = args.slice(1).join(" ") || "Hello World!";
    const routingKey = args.length > 0 ? args[0] : "knee";

    channel.assertExchange(exchange, "direct", { durable: false });
    channel.publish(exchange, routingKey, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });
  setTimeout(function () {
    connection.close();
    process.exit(0);
  }, 500);
});
