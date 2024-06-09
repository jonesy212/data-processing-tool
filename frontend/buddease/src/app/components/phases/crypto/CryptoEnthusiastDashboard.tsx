// CryptoEnthusiastDashboard.tsx
import { tradeApi } from '@/app/api/ApiTrade';
import { useEffect, useState } from 'react';
import { MarketData } from '../../crypto/TradingStrategy';
import { CryptoActions } from '../../actions/CryptoActions';
import React from "react";

const CryptoEnthusiastDashboard = () => {
  const [recentTrades, setRecentTrades] = useState<MarketData[]>([]);

  useEffect(() => {
    // Fetch recent trades data when the component mounts
    const fetchRecentTrades = async () => {
      try {
        const response = await tradeApi.getRecentTrades();
        const tradesData = response.data; // Extract data from Axios response
        setRecentTrades(tradesData);
      } catch (error) {
        console.error('Error fetching recent trades:', error);
        // Handle error fetching recent trades
      }
    };

    fetchRecentTrades();

   // Cleanup function to clear any ongoing processes or subscriptions
   return () => {
    // Call the cleanup action from CryptoActions
    CryptoActions.cleanup();
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
              <p>{trade.timestamp.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CryptoEnthusiastDashboard;
