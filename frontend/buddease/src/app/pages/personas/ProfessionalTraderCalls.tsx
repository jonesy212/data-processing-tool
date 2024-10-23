import React, { useState, useEffect } from "react";

// Importing tradingPlatforms and TradingPlatform types from the provided module
import {
  TradingPlatform,
  tradingPlatforms,
} from "@/app/components/crypto/TradingPlatform";
import { TraderCallsProps } from "@/app/components/trading/Trades";

interface ProfessionalTraderCallsProps extends TraderCallsProps {
  // Define props here, if any
}

const ProfessionalTraderCalls: React.FC<ProfessionalTraderCallsProps> = ({
  onSelectPlatform,
  selectedPlatform: propSelectedPlatform, // Renamed prop for clarity
}) => {
  // Add state to manage the selected trading platform
  const [selectedPlatformState, setSelectedPlatformState] =
    useState<TradingPlatform | null>(null);

  // Function to handle platform change
  const handlePlatformChange = (platformName: string) => {
    const platform = tradingPlatforms.find(
      (platform) => platform.name === platformName
    );
    setSelectedPlatformState(platform || null);
    onSelectPlatform(platform || null); // Call onSelectPlatform with platform or null
  };

  // Effect to synchronize props with local state
  useEffect(() => {
    // Update local state when props change
    if (propSelectedPlatform !== selectedPlatformState) {
      setSelectedPlatformState(propSelectedPlatform);
    }
  }, [propSelectedPlatform]); // Trigger effect when propSelectedPlatform changes

  return (
    <div>
      <h1>Professional Trader Calls</h1>
      {/* Add trading platform integration UI here */}
      <p>
        Trading Platform:{" "}
        {selectedPlatformState
          ? selectedPlatformState.name
          : "Select a trading platform"}
      </p>{" "}
      {/* Updated to use selectedPlatformState */}
      <select onChange={(e) => handlePlatformChange(e.target.value)}>
        <option value="">Select Trading Platform</option>
        {tradingPlatforms.map((platform) => (
          <option key={platform.name} value={platform.name}>
            {platform.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProfessionalTraderCalls;
