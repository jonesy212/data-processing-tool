// ProfessionalTraderCalls.tsx
import {
  TradingPlatform,
  tradingPlatforms,
} from "@/app/components/crypto/TradingPlatform";
import React, { useState } from "react";

interface ProfessionalTraderCallsProps {
  // Define props here, if any
  onSelectPlatform: (platform: TradingPlatform | null) => void; // Adjusted type to accept null
  selectedPlatform: TradingPlatform | null; // Adjusted type to accept null
}

const ProfessionalTraderCalls: React.FC<ProfessionalTraderCallsProps> = ({
  onSelectPlatform,
  selectedPlatform,
}) => {
  // Add state to manage the selected trading platform
  const [selectedPlatformState, setSelectedPlatformState] =
    useState<TradingPlatform | null>(null); // Renamed to avoid conflict with props name

  // Function to handle platform change
  const handlePlatformChange = (platformName: string) => {
    const platform = tradingPlatforms.find(
      (platform) => platform.name === platformName
    );
    setSelectedPlatformState(platform || null);
    onSelectPlatform(platform || null); // Call onSelectPlatform with platform or null
  };

  return (
    <div>
      <h1>Professional Trader Calls</h1>
      {/* Add trading platform integration UI here */}
      <p>
        Trading Platform:{" "}
        {selectedPlatform ? selectedPlatform.name : "Select a trading platform"}
      </p>{" "}
      {/* Updated to use selectedPlatform prop */}
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
