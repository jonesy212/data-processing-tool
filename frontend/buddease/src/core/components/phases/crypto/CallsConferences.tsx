// CallsConferences.tsx

import React, { useEffect, useState } from 'react';

interface Conference {
  id: number;
  title: string;
  date: string;
  location: string;
}



interface ConferenceProps {
    onComplete: () => void; // Define the onComplete function type
  }


const CallsConferences: React.FC<ConferenceProps> = ({
    onComplete
}) => {
  const [conferences, setConferences] = useState<Conference[]>([]);

  useEffect(() => {
    // Fetch conference data from API
    const fetchConferences = async () => {
      try {
        const response = await fetch('api/conferences');
        if (!response.ok) {
          throw new Error('Failed to fetch conferences');
        }
        const data = await response.json();
        setConferences(data);
      } catch (error) {
        console.error('Error fetching conferences:', error);
      }
    };

    fetchConferences();

    // Cleanup function
    return () => {
      // Perform cleanup if needed
    };
  }, []);

  return (
    <div>
      <h2>Calls and Conferences</h2>
      <ul>
        {conferences.map((conference) => (
          <li key={conference.id}>
            <h3>{conference.title}</h3>
            <p>Date: {conference.date}</p>
            <p>Location: {conference.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CallsConferences;
