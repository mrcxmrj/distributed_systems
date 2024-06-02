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
  return correlationId;
}

const getRandomBoolean = () => Math.random() >= 0.5;
const getRandomSeconds = () => Math.random() * 10000;
const getRandomName = () => (getRandomBoolean() ? "John" : "Jane");
const getRandomExamType = () => {
  const randomNumber = Math.random();
  if (randomNumber <= 0.33) return "knee";
  if (randomNumber <= 0.66) return "hip";
  return "elbow";
};

const log = (username: string, content: string) =>
  console.log(`[${new Date().toLocaleTimeString()}] ${username}> ${content}`);

export {
  consumeMessage,
  sendMessage,
  getRandomBoolean,
  getRandomSeconds,
  getRandomName,
  getRandomExamType,
  log,
};
