import React from "react";

import { endpoints } from "@/app/api/ApiEndpoints";
import { useState } from "react";
import { DocumentData } from "../../documents/DocumentBuilder";
import axiosInstance from "../../security/csrfToken";
import { DatasetModel } from "../../todos/tasks/DataSetModel";
import Visualization from "./Visualization"; // Assuming you have the Visualization component

interface RandomWalkVisualizationProps {
  updateTeamData: (randomWalk: number[]) => void; // Define the prop type
}

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
    suggestions.push("You reached a high position in the random walk!");
  }

  return suggestions;
};





const RandomWalkVisualization: React.FC<RandomWalkVisualizationProps> = ({
  updateTeamData,
}) => {
  const [randomWalk, setRandomWalk] = useState<number[]>([]); // Define the type as number[]
  const [suggestions, setSuggestions] = useState<string[]>([]); // Define the type as string[]

  // Function to suggest related documents based on the random walk
  const suggestRelatedDocuments = async (randomWalk: number[]) => {
    try {
      // Make API call to retrieve documents based on topics identified in the random walk
      const response = await axiosInstance.get(endpoints.data.list);
      const documents = response.data; // Assuming the response contains a list of documents

      // Perform content analysis on documents and identify key topics
      // Compare topics with topics identified in the random walk
      // Implement your logic to suggest related documents

      // Placeholder logic for demonstration purposes
      const suggestedDocuments = documents.filter((document: DocumentData) =>
        document.topics.includes("placeholderTopic")
      );

      // Return suggested documents
      return suggestedDocuments;
    } catch (error) {
      console.error("Error suggesting related documents:", error);
      // Log the error for debugging purposes
      // Notify the user or handle the error gracefully based on the application requirements
      return []; // Return an empty array in case of error
    }
  };

  // Function to handle the generation of a new random walk

  const handleGenerateRandomWalk = () => {
    const newRandomWalk = generateRandomWalk();
    setRandomWalk(newRandomWalk);

    const newSuggestions = suggestBasedOnRandomWalk(newRandomWalk);
    setSuggestions(newSuggestions);

    // Call suggestRelatedDocuments to retrieve suggested documents based on the new random walk
    suggestRelatedDocuments(newRandomWalk)
      .then((suggestedDocuments) => {
        console.log("Suggested documents:", suggestedDocuments);
        // Optionally update the state or perform other actions based on the suggested documents
      })
      .catch((error) => {
        console.error("Error retrieving suggested documents:", error);
      });
  };

  return (
    <div>
      <button onClick={handleGenerateRandomWalk}>Generate Random Walk</button>
      {/* Visualize the random walk */}
      {randomWalk.length > 0 && (
        <Visualization
          datasets={{} as DatasetModel[]}
          type="line"
          data={[randomWalk]}
          labels={["Steps"]}
        />
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
