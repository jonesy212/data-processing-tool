'use strict';
// Import necessary libraries
import { createInterface } from 'readline';


import MachineLearningModel from './machineLearningModel';

// Create an instance of the machine learning model
const model = new MachineLearningModel();

// Function to read data from a file
const readFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    // Read the file asynchronously
    if (typeof window === 'undefined') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    } else {
      // Handle file reading in the browser environment (if needed)
      // For example, fetch the file from a server
      // Resolve with empty string for now
      resolve('');
    }
  });
};

// Function to parse JSON data
const parseJSON = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Failed to parse JSON data');
  }
};

// Function to get user input from the command line
const getUserInput = () => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the current price: ', (price) => {
      rl.close();
      resolve(parseFloat(price));
    });
  });
};

// Main function to make predictions
const predictPrice = async () => {
  try {
    // Read data from a file
    const fileData = await readFile('historicalData.json');

    // Parse JSON data
    const historicalData = parseJSON(fileData);

    // Train the machine learning model with historical data
    await model.trainModel(historicalData);

    // Get user input for the current price
    const currentPrice = await getUserInput();

    // Make predictions using the trained model
    const predictedPrice = model.predictPrice(currentPrice);

    console.log(`Predicted price: ${predictedPrice}`);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Call the predictPrice function
predictPrice();
