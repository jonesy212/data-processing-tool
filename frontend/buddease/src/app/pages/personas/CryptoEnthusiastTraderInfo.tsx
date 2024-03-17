// CryptoEnthusiastTraderInfo.tsx
import React from 'react';

interface TraderInfo {
  id: number;
  name: string;
  tradingStyle: string;
  successRate: number;
  reviews: string[];
}

const CryptoEnthusiastTraderInfo: React.FC<{ traderInfo: TraderInfo }> = ({ traderInfo }) => {
  return (
    <div>
      <h2>Trader Information</h2>
      <p>Name: {traderInfo.name}</p>
      <p>Trading Style: {traderInfo.tradingStyle}</p>
      <p>Success Rate: {traderInfo.successRate}%</p>
      <h3>Reviews:</h3>
      <ul>
        {traderInfo.reviews.map((review, index) => (
          <li key={index}>{review}</li>
        ))}
      </ul>
    </div>
  );
};

export default CryptoEnthusiastTraderInfo;
