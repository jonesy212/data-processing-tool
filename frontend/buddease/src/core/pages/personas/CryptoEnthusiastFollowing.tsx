// CryptoEnthusiastFollowing.tsx
import React, { useState } from 'react';

interface Trader {
  id: number;
  name: string;
}

const CryptoEnthusiastFollowing: React.FC = () => {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [newTraderName, setNewTraderName] = useState<string>('');

  const handleAddTrader = () => {
    if (newTraderName.trim() !== '') {
      const newTrader: Trader = {
        id: traders.length + 1,
        name: newTraderName.trim(),
      };
      setTraders([...traders, newTrader]);
      setNewTraderName('');
    }
  };

  return (
    <div>
      <h2>Traders Followed:</h2>
      <ul>
        {traders.map((trader) => (
          <li key={trader.id}>{trader.name}</li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={newTraderName}
          onChange={(e) => setNewTraderName(e.target.value)}
          placeholder="Enter trader name"
        />
        <button onClick={handleAddTrader}>Follow Trader</button>
      </div>
    </div>
  );
};

export default CryptoEnthusiastFollowing;
