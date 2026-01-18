// TradingReviewStep.tsx
import React from "react";

import { TradeData } from "@/core/components/trading/TradeData";
import ReviewStep from "@/core/phases/steps/ReviewSteps";
import { StepProps } from "@/core/phases/steps/steps";
interface TradingReviewStep extends StepProps {
    onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
    tradeData: TradeData
}


// Specific Review Step Components
const TradingReviewStep: React.FC<TradingReviewStep> = ({ onSubmit, tradeData }) => {
  const tradingContent = (
    <div>
      {/* Display trading-related information */}

      {/* Example: Trading assets, strategies, preferences, etc. */}

    </div>
  );

  return (
    <ReviewStep
      title="Trading Review"
      content={tradingContent}
      onSubmit={onSubmit}
      tradeData={tradeData}
    />
  );
};


export default TradingReviewStep