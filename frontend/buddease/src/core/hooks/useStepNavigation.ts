useStepNavigation.ts
app/hooks/useStepNavigation.ts
import { useState } from 'react';

export interface Step {
  id: string;
  title: string;
  component: React.ComponentType<StepComponentProps>;
  status?: 'pending' | 'active' | 'completed';
  props?: Record<string, any>; 

  description?: string;           
  role?: string;                  
  phase?: string;                 
  next?: string;                  
  back?: string;                  

}

export interface StepComponentProps {
  onNext: (data?: any) => void;
  onPrevious: () => void;
  onSubmit: (data: any) => void;
  currentStep: number;
  totalSteps: number;
  stepData: any;
}

export const useStepNavigation = (initialSteps: Step[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [steps, setSteps] = useState<Step[]>(
    initialSteps.map((step, index) => ({
      ...step,
      status: step.status || (index === 0 ? 'active' : 'pending') 
    }))
  );

  const updateStepStatus = (stepIndex: number, status: Step['status']) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status } : step
    ));
  };

  const goToNext = (data?: any) => {
    if (currentStep < steps.length - 1) {
      // Save data for current step
      if (data) {
        setStepData(prev => ({ ...prev, [steps[currentStep].id]: data }));
      }
      
      updateStepStatus(currentStep, 'completed');
      setCurrentStep(prev => prev + 1);
      updateStepStatus(currentStep + 1, 'active');
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      updateStepStatus(currentStep, 'pending');
      setCurrentStep(prev => prev - 1);
      updateStepStatus(currentStep - 1, 'active');
    }
  };

  const submitAll = (finalData?: any) => {
    const allData = finalData ? { ...stepData, final: finalData } : stepData;
    console.log('All step data:', allData);
    // Handle final submission logic here
    return allData;
  };

  return {
    currentStep,
    steps,
    stepData,
    goToNext,
    goToPrevious,
    submitAll,
    updateStepData: setStepData
  };
};