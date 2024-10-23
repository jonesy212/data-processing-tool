// DoYourOwnResearch.tsx

import React, { useEffect, useState } from 'react';

interface ResearchItem {
  id: number;
  title: string;
  content: string;
}


interface ResearchProps {
    onComplete: () => void; // Define the onComplete function type
  }

const DoYourOwnResearch: React.FC<ResearchProps> = ({
    onComplete
}) => {
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);

  useEffect(() => {
    // Fetch research items data from API
    const fetchResearchItems = async () => {
      try {
        const response = await fetch('api/researchItems');
        if (!response.ok) {
          throw new Error('Failed to fetch research items');
        }
        const data = await response.json();
        setResearchItems(data);
      } catch (error) {
        console.error('Error fetching research items:', error);
      }
    };

    fetchResearchItems();

    // Cleanup function
    return () => {
      // Perform cleanup if needed
    };
  }, []);

  return (
    <div>
      <h2>Do Your Own Research</h2>
      <ul>
        {researchItems.map((item) => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoYourOwnResearch;
