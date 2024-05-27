// FollowTraders.tsx

import React, { useEffect, useState } from "react";

interface Trader {
  id: number;
  name: string;
  description: string;
}

interface TraderProps {
  onComplete: () => void; // Define the onComplete function type
}




const FollowTraders: React.FC<TraderProps> = ({ onComplete }) => {
  const [traders, setTraders] = useState<Trader[]>([]);

  useEffect(() => {
    // Fetch traders data from API
    const fetchTraders = async () => {
      try {
        const response = await fetch("api/traders");
        if (!response.ok) {
          throw new Error("Failed to fetch traders");
        }
        const data = await response.json();
        setTraders(data);
      } catch (error) {
        console.error("Error fetching traders:", error);
      }
    };

    fetchTraders();

    // Cleanup function
    return () => {
      // Perform cleanup if needed
    };
  }, []);

  return (
    <div>
      <h2>Follow Traders</h2>
      <ul>
        {traders.map((trader) => (
          <li key={trader.id}>
            <h3>{trader.name}</h3>
            <p>{trader.description}</p>
          </li>
        ))}
      </ul>
      <button onClick={onComplete}>Complete</button>
    </div>
  );
};

export default FollowTraders;
