// StepComponent.tsx
import { StepProps } from "@/core/phases/steps/steps";
import { useStepContext } from "@/core/state/context/StepContext";


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