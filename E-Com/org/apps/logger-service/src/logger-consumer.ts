// logger-consumer.ts
import { getConsumer } from "@packages/utils/kafka";
import { clients } from "./main";
import WebSocket from "ws"

const processLogs = (logs: string[]) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      logs.forEach(log => {
        try {
          client.send(log);
        } catch (err) {
          console.error('WebSocket send error:', err);
        }
      });
    }
  });
};

export const consumeKafkaMessages = async () => {
  const consumer = await getConsumer("log-events-group");

  await consumer.subscribe({ topic: "logs", fromBeginning: false });

  let logBatch: string[] = [];
  let batchTimeout: NodeJS.Timeout;

  consumer.on('consumer.crash', async (event) => {
    console.error('Consumer crashed:', event.payload.error);
    setTimeout(consumeKafkaMessages, 5000); // Reconnect after 5 seconds
  });

  try {
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        logBatch.push(message.value.toString());

        clearTimeout(batchTimeout);
        if (logBatch.length >= 100) {
          processLogs([...logBatch]);
          logBatch = [];
        } else {
          batchTimeout = setTimeout(() => {
            if (logBatch.length > 0) {
              processLogs([...logBatch]);
              logBatch = [];
            }
          }, 100);
        }
      },
    });
  } catch (error) {
    console.error('Failed to run consumer:', error);
    setTimeout(consumeKafkaMessages, 5000); // Reconnect after 5 seconds
  }
};