import React, { createContext, useContext, useState } from 'react';

interface StepContextType {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  steps: React.ReactNode[];
  handleNext: () => void;
  handlePrevious: () => void;
  handleSubmit: () => void;
}

const StepContext = createContext<StepContextType | undefined>(undefined);

export const useStepContext = () => {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error('useStepContext must be used within a StepProvider');
  }
  return context;
};

const StepProvider: React.FC<{ initialStep: number; steps: React.ReactNode[], children: React.ReactNode }> = ({
  initialStep,
  steps,
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Your submit logic here
  };

  return (
    <StepContext.Provider
      value={{ currentStep, setCurrentStep, steps, handleNext, handlePrevious, handleSubmit }}
    >
      {children}
    </StepContext.Provider>
  );
};

export default StepProvider;
