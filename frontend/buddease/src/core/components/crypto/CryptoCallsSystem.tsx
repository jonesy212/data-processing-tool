// CryptoCallsSystem.tsx
import CryptoEnthusiastCalls from "@/core/components/phases/crypto/CryptoEnthusiastCalls";
import ProfessionalTraderCalls from "@/core/pages/personas/ProfessionalTraderCalls";
import React, { useEffect, useState } from "react";
import { TradingPlatform } from "./TradingPlatform";

interface CrpytoCallsSystemProps {
  onSelectPlatform: (platform: string | null) => void;
}

const CryptoCallsSystem: React.FC = () => {

  // Define the selected platform state and handle change function for traders
  const [selectedPlatform, setSelectedPlatform] = useState<TradingPlatform | null>(null); // Fixed type to TradingPlatform | null
  const handlePlatformChange = (platform: TradingPlatform | null) => {
    setSelectedPlatform(platform);
  };

  // Add any shared effects or data fetching logic

  useEffect(() => {
    // Add any shared data fetching or initialization logic here
  }, []);

  return (
    <div>
      <h1>Crypto Calls System</h1>
      {/* Render the ProfessionalTraderCalls component for traders */}
      <ProfessionalTraderCalls onSelectPlatform={handlePlatformChange} selectedPlatform={selectedPlatform} /> // Passed selectedPlatform state


{/* Render the CryptoEnthusiastCalls component for enthusiasts */}
      <CryptoEnthusiastCalls />
    </div>
  );
};

export default CryptoCallsSystem;
