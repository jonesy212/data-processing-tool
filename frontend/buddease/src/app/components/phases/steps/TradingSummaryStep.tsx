// TradingSummaryStep.tsx
import React from "react";
import { TradeData } from "../../trading/TradeData";
import SummaryStep from "./SummaryStep";
import { StepProps } from "./steps";


interface TradingSummaryStep extends StepProps {
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tradeData: TradeData;
  tradeDetails: TradeDetai;
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