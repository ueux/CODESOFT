// logger-producer.ts
import { getProducer } from "../kafka";

export async function sendLog({
  type = "info",
  message,
  source = "unknown-service",
}: {
  type?: "info" | "error" | "warning" | "success" | "debug";
  message: string;
  source?: string;
}) {
  const logPayload = {
    type,
    message,
    timestamp: new Date().toISOString(),
    source,
  };

  try {
    const producer = await getProducer();
    await producer.send({
      topic: "logs",
      messages: [{ value: JSON.stringify(logPayload) }],
    });
  } catch (error) {
    console.error("Failed to send log to Kafka:", error);
    throw error;
  }
  // Note: We don't disconnect the producer here anymore
}