import * as amqp from "amqplib";

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

    channel.consume(
      q.queue,
      (msg) => {
        if (msg?.content) {
          console.log(
            ` [x] Processing ${msg.fields.routingKey}: '${msg.content.toString()}'`,
          );
          setTimeout(() => {
            console.log(" [x] Done");
            channel.ack(msg);
          }, 1000);
        }
      },
      {
        noAck: false,
      },
    );
  });
})();
