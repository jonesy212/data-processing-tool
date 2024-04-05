// machineLearningModel.ts

// Import necessary libraries
import * as tf from '@tensorflow/tfjs';
import { MarketData } from './TradingStrategy';

// Define the machine learning model class
class MachineLearningModel {
  model: tf.LayersModel;

  constructor() {
    // Define and compile the machine learning model
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    this.model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
  }

  // Train the machine learning model with historical market data
  async trainModel(data: MarketData[]): Promise<void> {
    // Prepare data for training
    const xs = data.map(item => item.price);
    const ys = data.map(item => item.target); // Assuming 'target' is the label to predict

    // Convert data to TensorFlow tensors
    const xsTensor = tf.tensor2d(xs, [xs.length, 1]);
    const ysTensor = tf.tensor2d(ys, [ys.length, 1]);

    // Train the model
    await this.model.fit(xsTensor, ysTensor, { epochs: 10 });

    console.log('Model training completed.');
  }

  // Make predictions using the trained model
  predictPrice(price: number): number {
    const input = tf.tensor2d([price], [1, 1]);
    const prediction = this.model.predict(input) as tf.Tensor;
    return prediction.dataSync()[0];
  }
    
}

export default MachineLearningModel;
