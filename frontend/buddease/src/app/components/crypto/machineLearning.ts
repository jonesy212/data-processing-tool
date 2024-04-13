// machineLearningModel.ts

// Import necessary libraries
import * as tf from "@tensorflow/tfjs";
import { MarketData } from "./TradingStrategy";

// Define the machine learning model class
class MachineLearningModel {
  model: tf.LayersModel;

  constructor() {
    // Define and compile the machine learning model
    this.model = tf.sequential();
    (this.model as tf.Sequential).add(
      tf.layers.dense({ units: 1, inputShape: [1] })
    );
    this.model.compile({ loss: "meanSquaredError", optimizer: "sgd" });
  }

  // Train the machine learning model with historical market data
  
  // Train the machine learning model with historical market data
  async trainModel(data: MarketData[], validationSplit: number = 0.2): Promise<void> {
    // Shuffle and split data into training and validation sets
    tf.util.shuffle(data);
    const splitIndex = Math.floor(data.length * (1 - validationSplit));
    const trainingData = data.slice(0, splitIndex);
    const validationData = data.slice(splitIndex);

    // Prepare data for training
    const xs = trainingData.map((item) => item.price ?? 0); // Replace null values with 0
    const ys = trainingData.map((item) => item.target ?? 0); // Replace null values with 0

    // Convert data to TensorFlow tensors
    const xsTensor = tf.tensor2d(xs, [xs.length, 1]);
    const ysTensor = tf.tensor2d(ys, [ys.length, 1]);

    // Train the model
    const history = await this.model.fit(xsTensor, ysTensor, { 
      epochs: 10,
      validationSplit: validationSplit,
      callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 5 })
    });

    console.log("Model training completed.");

    // Print final training and validation loss
    console.log("Final training loss:", history.history.loss[history.epoch.length - 1]);
    console.log("Final validation loss:", history.history.val_loss[history.epoch.length - 1]);
  }

  // Make predictions using the trained model
  predictPrice(price: number): number {
    const input = tf.tensor2d([price], [1, 1]);
    const prediction = this.model.predict(input) as tf.Tensor;
    return prediction.dataSync()[0];
  }

  // Save the trained model to disk
  async saveModel(): Promise<void> {
    await this.model.save('localstorage://my-model');
    console.log("Model saved successfully.");
  }

  // Load a saved model from disk
  async loadModel(): Promise<void> {
    this.model = await tf.loadLayersModel('localstorage://my-model');
    console.log("Model loaded successfully.");
  }
}

export default MachineLearningModel;
