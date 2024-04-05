// Import necessary libraries
const readline = require('readline');
let fs;
if (typeof window === 'undefined') {
  fs = require('fs');
}
const MachineLearningModel = require('./machineLearningModel');

// Create an instance of the machine learning model
const model = new MachineLearningModel();

// Function to read historical market data from a file
const readHistoricalDataFromFile = (filePath) => {
  let rawData;
  if (typeof window === 'undefined') {
    rawData = fs.readFileSync(filePath, 'utf8');
  }
  return JSON.parse(rawData);
};

// Function to get user input from the command line
const getUserInput = () => {
  const rl = readline.createInterface({
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
    // Read historical market data from a file
    const historicalData = readHistoricalDataFromFile('historicalData.json');

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
