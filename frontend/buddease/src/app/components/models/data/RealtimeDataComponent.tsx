// RealtimeDataComponent.tsx
import React, { useEffect } from 'react';

interface RealtimeDataProps {
  id: string;
  name: string;
  date: Date | undefined;
  userId: string;
  dispatch: any; // Adjust the type according to your Redux setup
}

const RealtimeDataComponent: React.FC<RealtimeDataProps> = ({
  id,
  name,
  date,
  userId,
  dispatch,
}) => {
  // Simulate real-time updates by setting up a useEffect with an empty dependency array
  useEffect(() => {
    // Replace this with your actual real-time update logic
    const intervalId = setInterval(() => {
      // Dispatch actions or perform other real-time update operations
      console.log("Real-time update for:", id);
    }, 5000); // Update interval in milliseconds (e.g., every 5 seconds)

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this effect runs only once on component mount

  return (
    <div>
      <h3>Real-time Data Component</h3>
      <p>ID: {id}</p>
      <p>Name: {name}</p>
      <p>Date: {date?.toLocaleString()}</p>
      <p>User ID: {userId}</p>
    </div>
  );
};

export default RealtimeDataComponent;
