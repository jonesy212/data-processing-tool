// components/BrowserCompatibility.tsx
import React from 'react';

interface BrowserCompatibilityProps {
  browsers: string[];
}

const BrowserCompatibility: React.FC<BrowserCompatibilityProps> = ({ browsers }) => {
  return (
    <div>
      <h2>Browser Compatibility</h2>
      <ul>
        {browsers.map((browser, index) => (
          <li key={index}>{browser}</li>
        ))}
      </ul>
    </div>
  );
};

export default BrowserCompatibility;
