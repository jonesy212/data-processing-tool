// SentimentAnalysis.tsx
import React, { useEffect, useState } from 'react';

const SentimentAnalysis: React.FC<{ text: string }> = ({ text }) => {
  const [sentiment, setSentiment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Perform sentiment analysis when the component mounts or when the text prop changes
    fetchSentimentAnalysis(text)
      .then((result) => {
        setSentiment(result.sentiment);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching sentiment analysis:', error);
        setLoading(false);
      });
  }, [text]);


  const fetchSentimentAnalysis = async (text: string): Promise<{ sentiment: string }> => {
    // Simulate API call to fetch sentiment analysis result
    // Replace this with actual API call to your sentiment analysis service
    return new Promise<{ sentiment: string }>((resolve, reject) => {
      // Example: fetch sentiment analysis from a backend API
      setTimeout(() => {
        // Simulate API response
        const randomSentiment = Math.random() < 0.5 ? 'Positive' : 'Negative'; // Randomly generate sentiment
        resolve({ sentiment: randomSentiment });
      }, 2000); // Simulate 2 seconds delay
    });
  };

  return (
    <div>
      {loading ? (
        <p>Loading sentiment analysis...</p>
      ) : (
        <p>Sentiment analysis result: {sentiment}</p>
      )}
    </div>
  );
};

export default SentimentAnalysis;
