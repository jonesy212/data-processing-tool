// steps.tsx

import React from "react";
import onSubmit, { ButtonProps } from "../../libraries/ui/buttons/onSubmit";
import { TradeData } from "../../trading/TradeData";
import TradingReviewStep from "../../trading/TradingReviewStep";
import TradingPreferencesStep from "../TradingPreferencesStep";
import TradingBasicInfoStep from "./TradingBasicInfoStep";
import TradingSummaryStep from "./TradingSummaryStep";

// Import other step components as needed

interface StepProps {
  title: string;
  content: JSX.Element;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tradeData?: TradeData;
}


const [tradeData, setTradeData] = useState<any>({
  // Initialize with default values or empty objects as needed
});


const handleSubmit = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => {
  console.log("Form submitted");
  onSubmit(event );
};

const steps: StepProps[] = [
  
  {
    title: "Trading Basic Info",
    content: <TradingBasicInfoStep
    onSubmit={(event) => { handleSubmit(event); }}
    />,
    onSubmit: onSubmit,
    tradeData: undefined,
  },
  {
    title: "Trading Preferences",
    content: <TradingPreferencesStep
      onSubmit={onSubmit}
    />,
    onSubmit: onSubmit,
    tradeData: undefined,
  },
  {
    title: "Trading Summary",
    content: <TradingSummaryStep
      onSubmit={onSubmit} tradeData={tradeData}
    />,
    onSubmit: onSubmit,
    tradeData: undefined,
  },
  {
    title: "Trading Review",
    content: <TradingReviewStep
      onSubmit={onSubmit}
      tradeData={tradeData} />,
    onSubmit: onSubmit,
    tradeData: undefined,
  },
];

export default steps;
function useState<T>(arg0: {}): [any, any] {
  throw new Error("Function not implemented.");
}

export type { StepProps };
