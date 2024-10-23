// CryptoSectionToolbar.tsx
import React from 'react';
import ToolbarItem from '../documents/ToolbarItem';

interface CryptoSectionToolbarProps {
  onTradeClick: () => void; // Function to handle trade button click
  onMarketAnalysisClick: () => void; // Function to handle market analysis button click
  onCommunityClick: () => void; // Function to handle community button click
}

const CryptoSectionToolbar: React.FC<CryptoSectionToolbarProps> = ({
  onTradeClick,
  onMarketAnalysisClick,
  onCommunityClick,
}) => {
  return (
    <div className="crypto-toolbar">
      <h2>Crypto Section Toolbar</h2>
      <div className="crypto-buttons">
        <ToolbarItem id="trade-button" label="Trade" onClick={onTradeClick} />
        <ToolbarItem
          id="market-analysis-button"
          label="Market Analysis"
          onClick={onMarketAnalysisClick}
        />
        <ToolbarItem id="community-button" label="Community" onClick={onCommunityClick} />
      </div>
    </div>
  );
};

export default CryptoSectionToolbar;
