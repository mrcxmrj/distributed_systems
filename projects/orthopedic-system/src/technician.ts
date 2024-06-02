import * as amqp from "amqplib/callback_api";

const proficiencies = process.argv.slice(2);

if (proficiencies.length != 2) {
  console.log("Usage: technician.js [proficiency_1] [proficiency_2]");
  process.exit(1);
}

amqp.connect("amqp://localhost", (error, connection) => {
  if (error) {
    console.error(error);
  }
  connection.createChannel((error, channel) => {
    if (error) {
      console.error(error);
    }

    const exchange = "examination_request";

    channel.assertExchange(exchange, "direct", { durable: false });
    proficiencies.forEach((proficiency) =>
      channel.assertQueue(
        proficiency,
        {
          exclusive: false,
        },
        (error, q) => {
          if (error) {
            console.error(error);
          }

          console.log(`asserted ${proficiency}`);
          console.log(
            " [*] Waiting for messages in %s. To exit press CTRL+C",
            q.queue,
          );
          console.log(`bound ${proficiency}`);

          // FIXME:
          channel.bindQueue(q.queue, exchange, proficiency);

          channel.consume(
            q.queue,
            (msg) => {
              if (msg?.content) {
                console.log(
                  " [x] %s: '%s'",
                  msg.fields.routingKey,
                  msg.content.toString(),
                );
              }
            },
            {
              noAck: true,
            },
          );
        },
      ),
    );
  });
});
