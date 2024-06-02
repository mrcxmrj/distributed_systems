import * as amqp from "amqplib/callback_api";

amqp.connect("amqp://localhost", (error0, connection) => {
  if (error0) {
    throw error0;
  }
  connection.createChannel((error1, channel) => {
    if (error1) {
      throw error1;
    }

    const queue = "task_queue";

    channel.assertQueue(queue, {
      durable: true,
    });
    channel.prefetch(1);

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(
      queue,
      (msg) => {
        if (!msg) return;
        console.log(" [x] Received %s", msg?.content.toString());
        const secondsToWait = msg.content.toString().split(".").length - 1;
        setTimeout(() => {
          console.log(" [x] Done"), secondsToWait * 1000;
          channel.ack(msg);
        });
      },
      {
        noAck: false,
      },
    );
  });
});
