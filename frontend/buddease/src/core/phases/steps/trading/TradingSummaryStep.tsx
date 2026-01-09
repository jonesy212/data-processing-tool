TradingSummaryStep.tsx
import { TradeData } from "@/core/components/trading/TradeData";
import SummaryStep from "@/core/phases/steps/SummaryStep";
import { StepProps } from "@/core/phases/steps/steps";
import React from "react";


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