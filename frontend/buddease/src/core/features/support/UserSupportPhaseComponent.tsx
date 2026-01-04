UserSupportPhaseComponent.tsx

import { BasicInfoStep } from '@/core/components/shared/steps/BasicInfoStep';
import { GenericStepContainer } from '@/core/components/shared/steps/GenericStepContainer';
import { useStepNavigation } from '@/core/hooks/useStepNavigation';
import { UserSupportPhase } from '@/core/typings/supportTypes';
import React from 'react';

interface UserSupportPhaseProps {
  initialPhase: UserSupportPhase;
  onPhaseChange?: (phase: UserSupportPhase, data?: any) => void;
}

const UserSupportPhaseComponent: React.FC<UserSupportPhaseProps> = ({
  initialPhase,
  onPhaseChange
}) => {
  // Define steps for each phase with proper Step interface structure
  const phaseSteps = {
    [UserSupportPhase.USER_PHASE_PLANNING]: [
      {
        id: 'support-needs',
        title: 'Support Needs Assessment',
        component: BasicInfoStep,
        status: 'pending' as const, // Add status
        props: {
          fields: [
            { label: 'Support Type', name: 'supportType', type: 'select' as const, options: ['Technical', 'Billing', 'Account', 'Other'], required: true },
            { label: 'Urgency Level', name: 'urgency', type: 'select' as const, options: ['Low', 'Medium', 'High', 'Critical'], required: true },
            { label: 'Description', name: 'description', type: 'textarea' as const, required: true }
          ]
        }
      },
      {
        id: 'resource-planning',
        title: 'Resource Planning',
        component: GenericStepContainer,
        status: 'pending' as const, // Add status
        props: {
          children: <div>Plan resources and assign support team members</div>
        }
      }
    ],
    [UserSupportPhase.EXECUTION]: [
      {
        id: 'action-plan',
        title: 'Action Plan',
        component: BasicInfoStep,
        status: 'pending' as const, // Add status
        props: {
          fields: [
            { label: 'Action Steps', name: 'actions', type: 'textarea' as const, required: true },
            { label: 'Timeline', name: 'timeline', type: 'text' as const, required: true }
          ]
        }
      }
    ],
    [UserSupportPhase.MONITORING]: [
      {
        id: 'progress-tracking',
        title: 'Progress Tracking',
        component: GenericStepContainer,
        status: 'pending' as const, // Add status
        props: {
          children: <div>Monitor support progress and user satisfaction</div>
        }
      }
    ],
    [UserSupportPhase.CLOSURE]: [
      {
        id: 'feedback',
        title: 'Feedback & Closure',
        component: BasicInfoStep,
        status: 'pending' as const, // Add status
        props: {
          fields: [
            { label: 'Resolution Summary', name: 'resolution', type: 'textarea' as const, required: true },
            { label: 'User Feedback', name: 'feedback', type: 'textarea' as const },
            { label: 'Satisfaction Rating', name: 'rating', type: 'select' as const, options: ['1', '2', '3', '4', '5'] }
          ]
        }
      }
    ]
  };

  const currentPhaseSteps = phaseSteps[initialPhase] || [];
  const { currentStep, steps, goToNext, goToPrevious, submitAll } = 
    useStepNavigation(currentPhaseSteps);

  const CurrentStepComponent = steps[currentStep]?.component;

  const handleStepSubmit = (data: any) => {
    if (currentStep === steps.length - 1) {
      // Last step in phase - submit phase data
      const phaseData = submitAll(data);
      onPhaseChange?.(initialPhase, phaseData);
    } else {
      goToNext(data);
    }
  };

  // Get the current step's props safely
  const currentStepProps = steps[currentStep]?.props || {};

  return (
    <div className="user-support-phase">
      <div className="phase-header">
        <h2>{UserSupportPhase[initialPhase]} Phase</h2>
        <div className="step-indicator">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {CurrentStepComponent && (
        <CurrentStepComponent
          onNext={handleStepSubmit}
          onPrevious={goToPrevious}
          onSubmit={handleStepSubmit}
          currentStep={currentStep}
          totalSteps={steps.length}
          stepData={{}}
          {...currentStepProps} // Now this will work
        />
      )}
    </div>
  );
};

export default UserSupportPhaseComponent;