// CryptoEnthusiastDashboard.tsx
import React, { useState, useEffect } from 'react';
import { getRecentTrades } from './api'; // Import API function to fetch recent trades

const CryptoEnthusiastDashboard = () => {
  const [recentTrades, setRecentTrades] = useState([]);

  useEffect(() => {
    // Fetch recent trades data when the component mounts
    const fetchRecentTrades = async () => {
      try {
        const trades = await getRecentTrades();
        setRecentTrades(trades);
      } catch (error) {
        console.error('Error fetching recent trades:', error);
        // Handle error fetching recent trades
      }
    };

    fetchRecentTrades();

    // Cleanup function to clear any ongoing processes or subscriptions
    return () => {
      // Perform cleanup if needed
    };
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return (
    <div>
      <h2>Crypto Enthusiast Dashboard</h2>
      <div>
        <h3>Recent Trades</h3>
        <ul>
          {recentTrades.map((trade, index) => (
            <li key={index}>
              <p>{trade.symbol}</p>
              <p>{trade.type}</p>
              <p>{trade.quantity}</p>
              <p>{trade.timestamp}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CryptoEnthusiastDashboard;
