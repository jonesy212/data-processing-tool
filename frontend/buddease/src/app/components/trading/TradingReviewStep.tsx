// TradingReviewStep.tsx

import ReviewStep from "../phases/steps/ReviewSteps";

// Specific Review Step Components
const TradingReviewStep: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
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
    />
  );
};


export default TradingReviewStep