import { Consumer, Kafka, Producer} from "kafkajs"

export const kafka = new Kafka({
    clientId: "kafka-service",
    brokers: ["d1ttqkc4tis6701qt9lg.any.ap-south-1.mpx.prd.cloud.redpanda.com:9092"],
    ssl: true,
    sasl: {
        mechanism: "scram-sha-256",
        username: process.env.KAFKA_API_KEY!,
        password:process.env.KAFKA_API_SECRET!,
    }
})


// Store instances
let producerInstance: Producer | null = null;
let consumerInstance: Consumer | null = null;

export const getProducer = async (): Promise<Producer> => {
  if (!producerInstance) {
    producerInstance = kafka.producer();
    await producerInstance.connect();
  }
  return producerInstance;
};

export const getConsumer = async (groupId: string): Promise<Consumer> => {
  if (!consumerInstance) {
    consumerInstance = kafka.consumer({ groupId });
    await consumerInstance.connect();
  }
  return consumerInstance;
};

export const disconnectAll = async () => {
  try {
    if (producerInstance) {
      await producerInstance.disconnect();
      producerInstance = null;
    }
    if (consumerInstance) {
      await consumerInstance.disconnect();
      consumerInstance = null;
    }
  } catch (error) {
    console.error('Error disconnecting Kafka clients:', error);
  }
};