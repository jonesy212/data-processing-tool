ReviewSteps.tsx
import { TradeData } from "@/core/components/trading/TradeData";
import { ButtonProps } from "@/core/libraries/ui/buttons/ReusableButton";
import React from 'react';

interface StepProps {
  title: string;
  content: JSX.Element;
  onSubmit: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface ReviewStepProps extends StepProps {
  tradeData?: TradeData;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  title,
  content,
  onSubmit: onSubmitHandler,
}) => {
  const handleOnClick = (event: MouseEvent<HTMLButtonElement>) => {
    console.log("Form submitted");
    onSubmitHandler(event); // Pass the event to the onSubmit handler
  };

  return (
    <div>
      <h2>{title}</h2>
      {content}
      <ButtonProps onClick={handleOnClick} />{" "}
      {/* Use the ButtonProps component */}
    </div>
  );
};

export default ReviewStep;
