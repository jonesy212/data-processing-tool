// GenericStepContainer.tsx

import React from 'react';
import { StepComponentProps } from '@/app/hooks/useStepNavigation';

interface GenericStepContainerProps extends StepComponentProps {
  title: string;
  children: React.ReactNode;
  showNavigation?: boolean;
}

export const GenericStepContainer: React.FC<GenericStepContainerProps> = ({
  title,
  children,
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  showNavigation = true
}) => {
  return (
    <div className="step-container">
      <div className="step-header">
        <h2>{title}</h2>
        <div className="step-progress">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>
      
      <div className="step-content">
        {children}
      </div>

      {showNavigation && (
        <div className="step-navigation">
          <button 
            onClick={onPrevious} 
            disabled={currentStep === 0}
            className="btn-secondary"
          >
            Previous
          </button>
          
          {currentStep < totalSteps - 1 ? (
            <button onClick={() => onNext()} className="btn-primary">
              Next
            </button>
          ) : (
            <button onClick={() => onNext()} className="btn-primary">
              Submit
            </button>
          )}
        </div>
      )}
    </div>
  );
};