// TradingSummaryStep.tsx
import React from "react";
import  { TradeData } from "../../trading/TradeData";
import SummaryStep from "./SummaryStep";


interface TradingSummaryStep {
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tradeData: TradeData;
}

// Specific Summary Step Components
const TradingSummaryStep: React.FC<TradingSummaryStep> = ({
  onSubmit, tradeData }) => {
  return (
    <SummaryStep
      title="Trading Summary "
      onSubmit={onSubmit}
      data={tradeData} />
  );
};
  

  export default TradingSummaryStep