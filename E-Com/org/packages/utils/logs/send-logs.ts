import { kafka } from "../kafka";

const producer = kafka.producer(); // Fixed: 'product' to 'producer'

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
        timestamp: new Date().toISOString(), // Fixed: 'toIS0String' to 'toISOString'
        source,
    }; // Removed extra closing parenthesis

    try {
        await producer.connect();
        await producer.send({
            topic: "logs",
            messages: [
                { value: JSON.stringify(logPayload) } // Fixed array structure
            ],
        });
    } catch (error) {
        console.error("Failed to send log to Kafka:", error);
        throw error; // Re-throw to let caller handle it
    } finally {
        await producer.disconnect().catch(e => {
            console.error("Failed to disconnect producer:", e);
        });
    }
}