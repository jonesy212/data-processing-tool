// TradingSummaryStep.tsx

import SummaryStep from "./SummaryStep";

// Specific Summary Step Components
const TradingSummaryStep: React.FC<{ tradingData: any }> = ({ tradingData }) => {
    return <SummaryStep title="Trading Summary" data={tradingData} />;
  };
  

  export default TradingSummaryStep