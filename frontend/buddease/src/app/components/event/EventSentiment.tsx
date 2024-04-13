// EventSentiment.tsx
import React, { useEffect, useState } from "react";
import { processAutoGPTOutputWithSpaCy } from "../Inteigents/AutoGPTSpaCyIntegration";
import LoadingSpinner from "../models/tracker/LoadingSpinner";
import useErrorHandling from "../hooks/useErrorHandling";

const EventSentiment: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const [sentiment, setSentiment] = useState<string>(""); // State to store sentiment
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
  const { handleError } = useErrorHandling(); // Use the useErrorHandling hook

  useEffect(() => {
    // Process AutoGPT output with spaCy and extract sentiment
    processAutoGPTOutputWithSpaCy(event.title)
      .then((enhancedPrompt: string | null) => {
        if (enhancedPrompt) {
          setSentiment(enhancedPrompt);
          setLoading(false);
        } else {
          setLoading(false);
          console.error("Failed to enhance prompt with spaCy entities");
        }
      })
      .catch((error: any) => {
        console.error("Error processing AutoGPT output with spaCy:", error);
          setLoading(false);
          handleError("Error processing AutoGPT output with spaCy", error); // Call the handleError function

      });
  }, [event.title, handleError]);

  return (
    <div>
      {/* Display loading spinner if loading is true */}
      <LoadingSpinner loading={loading} />

      {/* Display sentiment analysis */}
      {loading ? (
        <p>Loading sentiment analysis...</p>
      ) : (
        <p>
          Sentiment for event "{event.title}": {sentiment}
        </p>
      )}
    </div>
  );
};

export default EventSentiment;
