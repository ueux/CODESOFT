import * as tf from '@tensorflow/tfjs';
import { fetchUserActivity } from './fetch-user-activity';
import { preProcessData } from '../utils/preProcessData';

const EMBEDDING_DIM = 50;

interface UserAction {
    userId: string;
    productId: string;
    actionType: "product_view" | "add_to_cart" | "add_to_wishlist" | "purchase";
}

interface Interaction {
    userId: string;
    productId: string;
    actionType: UserAction["actionType"];
}

interface RecommendedProduct {
    productId: string;
    score: number;
}

async function getProcessedUserActivity(userId: string): Promise<UserAction[]> {
    const userActions = await fetchUserActivity(userId);
    return Array.isArray(userActions) ? (userActions as unknown as UserAction[]) : [];
}

export const recommendProducts = async (
    userId: string,
    allProducts: any
): Promise<string[]> => {
    const userActions: UserAction[] = await getProcessedUserActivity(userId);
    if (userActions.length === 0) return [];

    const processedData=preProcessData(userActions, allProducts);
    if (!processedData || !processedData.interactions||!processedData.products) return [];
    const {interactions}=processedData as{interactions:Interaction[]}
    // Create mappings from user/product IDs to indices
    const userMap: Record<string, number> = {};
    const productMap: Record<string, number> = {};
    let userCount = 0;
    let productCount = 0;

    interactions.forEach(({ userId, productId }) => {
        if (!(userId in userMap)) userMap[userId] = userCount++;
        if (!(productId in productMap)) productMap[productId] = productCount++;
    });

    // Define model architecture
    const userInput = tf.input({ shape: [1], dtype: "int32" }) as tf.SymbolicTensor;
    const productInput = tf.input({ shape: [1], dtype: "int32" }) as tf.SymbolicTensor;

    // Create embedding layers
    const userEmbedding = tf.layers.embedding({
        inputDim: userCount,
        outputDim: EMBEDDING_DIM
    }).apply(userInput) as tf.SymbolicTensor;

    const productEmbedding = tf.layers.embedding({
        inputDim: productCount,
        outputDim: EMBEDDING_DIM
    }).apply(productInput) as tf.SymbolicTensor;

    // Flatten embeddings
    const userVector = tf.layers.flatten().apply(userEmbedding) as tf.SymbolicTensor;
    const productVector = tf.layers.flatten().apply(productEmbedding) as tf.SymbolicTensor;

    // Dot product combines user and product vectors
    const merged = tf.layers.dot({ axes: 1 }).apply([userVector, productVector]) as tf.SymbolicTensor;

    // Final output layer
    const output = tf.layers.dense({ units: 1, activation: "sigmoid" }).apply(merged) as tf.SymbolicTensor;

    // Compile the model
    const model = tf.model({
        inputs: [userInput, productInput],
        outputs: output
    });

    model.compile({
        optimizer: tf.train.adam(),
        loss: "binaryCrossentropy",
        metrics: ["accuracy"]
    });

    // Prepare training data
    const userTensor = tf.tensor1d(
        interactions.map(d => userMap[d.userId] ?? 0),
        "int32"
    );

    const productTensor = tf.tensor1d(
        interactions.map(d => productMap[d.productId] ?? 0),
        "int32"
    );

    const weightLabels = tf.tensor2d(
        interactions.map(d => {
            switch (d.actionType) {
                case "purchase": return [1];
                case "add_to_cart": return [0.7];
                case "add_to_wishlist": return [0.5];
                case "product_view": return [0.1];
                default: return [0];
            }
        }),
        [interactions.length, 1]
    );

    // Train the model
    await model.fit([userTensor, productTensor], weightLabels, {
        epochs: 5,
        batchSize: 32
    });

    // Generate predictions for all products
    const productTensorAll = tf.tensor1d(Object.values(productMap), "int32");
    const userTensorAll = tf.tensor1d([userMap[userId] ?? 0], "int32").expandDims(1);

    const predictions = model.predict([
        tf.tile(userTensorAll, [productCount, 1]),
        productTensorAll.expandDims(1)
    ]) as tf.Tensor;

    const scores = (await predictions.array()) as number[];

    // Sort and select top 10 recommended products
    const recommendProducts: RecommendedProduct[] = Object.keys(productMap)
        .map((productId, index) => ({
            productId,
            score: scores[index] ?? 0
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    return recommendProducts.map((p)=>p.productId);
};