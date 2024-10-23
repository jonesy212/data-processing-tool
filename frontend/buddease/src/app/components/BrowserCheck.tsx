// components/BroswerCheck.tsx
import React from 'react';

interface BrowswerCheckProps {
  browsers: string[];
}

const BroswerCheck: React.FC<BrowswerCheckProps> = ({ browsers }) => {
  return (
    <div>
      <h2>Browser Check Store</h2>
      <ul>
        {browsers.map((browser, index) => (
          <li key={index}>{browser}</li>
        ))}
      </ul>
    </div>
  );
};

export default BroswerCheck;
