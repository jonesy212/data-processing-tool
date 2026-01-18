// steps.tsx
import TradingPreferencesStep from "@/core/components/phases/TradingPreferencesStep";
import { TradeData } from "@/core/components/trading/TradeData";
import TradingBasicInfoStep from "@/core/phases/steps/trading/TradingBasicInfoStep";
import TradingReviewStep from "@/core/phases/steps/trading/TradingReviewStep";
import TradingSummaryStep from "@/core/phases/steps/trading/TradingSummaryStep";
import { useStepContext } from "@/core/state/context/StepContext";
import IdeationPhase from "@/core/users/userJourney/IdeationPhase";
import React, { useState } from "react";


BaseStepProps.ts - Common props for all step components
interface BaseStepProps {
  title: string;
  currentStep?: number;
  totalSteps?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
}


interface StepProps {
  title: string;
  content?: JSX.Element;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tradeData?: TradeData;
  onConfirm?: () => void;
  message?: string;
}



interface TradeStepProps extends BaseStepProps {
  tradeData?: TradeData;
  onConfirm?: () => void;
  message?: string;
  // Trade-specific props
}

const [tradeData, setTradeData] = useState<any>({
  // Initialize with default values or empty objects as needed
});


const tradeDetails = {
  // Define tradeDetails properties here
  tradeId: "", // Example property
  tradeDate: new Date(), // Example property
  tradeType: "Buy", // Example property
  tradeAmount: 0,
  // Add more properties as needed
};

const handleSubmit = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => {
  const { currentStep, handleNext } = useStepContext();

  const handleStepSubmit = (data: any) => {
    setTradeData({ ...tradeData, ...data });
    handleNext();
  };

  console.log("Form submitted");
  // Do something with the trade data here
  setTradeData(tradeData);
  // If the form is valid, navigate to the next step
  // else, stay on the current step
  // Note: This is just an example, you can navigate to the next step
  // without validating the form data
  handleStepSubmit(tradeData);
};

const handleOnTransition = (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
) => {
  const { currentStep, handleNext } = useStepContext();
  const handleStepSubmit = (data: any) => {
    setTradeData({ ...tradeData, ...data });
    handleNext();
  };
  console.log("Form submitted");
  // Do something with the trade data here
  async function handleConfirmation(tradeData: any) {
    console.log("tradeData", tradeData);
    // If the form is valid, navigate to the next step
    // else, stay on the current step
    // Note: This is just an example, you can navigate to the next step
    // without validating the form data
    handleStepSubmit(tradeData);
  }
};

const steps: TradeStepProps[] = [
  {
    title: "Trading Basic Info",
    content: <TradingBasicInfoStep
      onSubmit={handleSubmit} />,
    onSubmit: handleSubmit,
  },
  {
    title: "Trading Preferences",
    content:
      <TradingPreferencesStep
        onSubmit={handleSubmit}
      />,
    onSubmit: handleSubmit,
  },
  {
    title: "Trading Summary",
    content: (
      <TradingSummaryStep
        title={""}
        onSubmit={handleSubmit}
        tradeData={tradeData}
        tradeDetails={tradeDetails}
      />
    ),
    onSubmit: handleSubmit,
    tradeData: tradeData,
  },
  {
    title: "Trading Review",
    content: (
      <TradingReviewStep
        onSubmit={handleSubmit}
        tradeData={tradeData}
      />
    ),
    onSubmit: handleSubmit,
    tradeData: tradeData,
  },

  {
    title: "Idea Submission",
    content: (
      <IdeationPhase
        onSubmit={handleSubmit}
        phaseName={""}
        onTransition={handleOnTransition}
      />
    ),
    onSubmit: handleSubmit,
  },
  {
    title: "Ideation",
    content: (
      <IdeationPhase
        onSubmit={handleSubmit}
        phaseName={""}
        onTransition={handleOnTransition}
      />
    ),
    onSubmit: handleSubmit,
  },
  // Add more steps as needed
];

export default steps;
export { tradeDetails };
export type { StepProps, TradeStepProps };

