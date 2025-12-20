// StepComponent.tsx
import React from "react";
import { useStepContext } from "@/app/state/context/StepContext";
import { StepProps } from "@/app/phases/steps/steps";


interface StepComponentProps extends StepProps {
  onNext: () => void;
  onPrevious: () => void;
  
}



const StepComponent = () => {
  const { currentStep, steps, handleNext, handlePrevious, handleSubmit } =
    useStepContext();
  const CurrentStepComponent = steps[currentStep]?.type;

  return (
    <div>
      {CurrentStepComponent && (
        <CurrentStepComponent
          onSubmit={handleSubmit}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
};
  
export default StepComponent