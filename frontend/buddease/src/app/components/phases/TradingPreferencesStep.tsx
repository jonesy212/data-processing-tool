// TradingPreferencesStep.tsx
import React from "react";

import PreferencesStep from "./actions/PreferencesStep";

// Specific Preferences Step Components
const TradingPreferencesStep: React.FC<{ onSubmit: (preferences: any) => void }> = ({ onSubmit }) => {
    return (
      <PreferencesStep
        title="Trading Preferences"
        label="Enter trading preferences"
        inputType="text"
        initialValue=""
        onSubmit={onSubmit}
      />
    );
  };
  

  export default TradingPreferencesStep