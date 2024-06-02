import * as amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";

function consumeMessage(
  channel: amqp.Channel,
  q: amqp.Replies.AssertQueue,
  callback: (message: amqp.ConsumeMessage) => void,
) {
  channel.consume(
    q.queue,
    (msg) => {
      if (msg?.content) {
        callback(msg);
      }
    },
    {
      noAck: false,
    },
  );
}

function sendMessage(
  channel: amqp.Channel,
  exchange: string,
  routingKey: string,
  msg: string,
  correlationId: string = uuidv4(),
) {
  channel.assertExchange(exchange, "direct", { durable: true });
  channel.publish(exchange, routingKey, Buffer.from(msg), {
    persistent: true,
    correlationId: correlationId,
  });
  console.log(" [x] Sent %s", msg);
  return correlationId;
}

function getRandomBoolean() {
  return Math.random() >= 0.5;
}

export { consumeMessage, sendMessage, getRandomBoolean };
