// EventSentiment.tsx
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import React, { useEffect, useState } from "react";
import useErrorHandling from "../hooks/useErrorHandling";
import { processAutoGPTOutputWithSpaCy } from "../intelligence/AutoGPTSpaCyIntegration";
import LoadingSpinner from "../models/tracker/LoadingSpinner";

const EventSentiment: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const [sentiment, setSentiment] = useState<string>(""); // State to store sentiment
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
  const { handleError } = useErrorHandling(); // Use the useErrorHandling hook



  const performSentimentAnalysis = async () => {
    setLoading(true);
    try {
      // Call API to perform sentiment analysis
      const response = await fetch('/api/sentiment-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${API_KEY}'
        },
        body: JSON.stringify({
          text: event.title,
        })
      })
        .then(response => response.json())
        .then(data => {
          setSentiment(data.sentiment);
          setLoading(false);
        })
      // Call API to perform sentiment analysis
      performSentimentAnalysis();
      
    } catch (error: any) {
      console.error('Error performing sentiment analysis:', error);
      setLoading(false);
      handleError('Error performing sentiment analysis', error);
    }
  }


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
