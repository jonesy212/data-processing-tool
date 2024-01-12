import { useState } from 'react';
import Visualization from './Visualization'; // Assuming you have the Visualization component

// Function to generate a random walk
const generateRandomWalk = (steps = 100) => {
  let randomWalk = [0];

  for (let i = 0; i < steps; i++) {
    let step = randomWalk[randomWalk.length - 1];
    let dice = Math.floor(Math.random() * 6) + 1;

    if (dice <= 2) {
      step = Math.max(0, step - 1);
    } else if (dice <= 5) {
      step = step + 1;
    } else {
      step = step + Math.floor(Math.random() * 6) + 1;
    }

    randomWalk.push(step);
  }

  return randomWalk;
};

// Function to connect with the prompting system
const suggestBasedOnRandomWalk = (randomWalk: any) => {
  // Implement your logic to suggest based on the random walk
  // You can use the values in the random walk to generate suggestions
  const suggestions = [];

  // Example: Suggest based on the final position of the random walk
  const finalPosition = randomWalk[randomWalk.length - 1];
  if (finalPosition > 50) {
    suggestions.push('You reached a high position in the random walk!');
  }

  return suggestions;
};

const RandomWalkVisualization = () => {
  const [randomWalk, setRandomWalk] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Function to handle the generation of a new random walk
  const handleGenerateRandomWalk = () => {
    const newRandomWalk = generateRandomWalk();
    setRandomWalk(newRandomWalk);

    // Get suggestions based on the new random walk
    const newSuggestions = suggestBasedOnRandomWalk(newRandomWalk);
    setSuggestions(newSuggestions);
  };

  return (
    <div>
      <button onClick={handleGenerateRandomWalk}>Generate Random Walk</button>

      {/* Visualize the random walk */}
      {randomWalk.length > 0 && (
        <Visualization type="line" data={[randomWalk]} labels={['Steps']} />
      )}

      {/* Display suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h3>Suggestions:</h3>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RandomWalkVisualization;
