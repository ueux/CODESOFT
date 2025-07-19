import { Kafka} from "kafkajs"

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