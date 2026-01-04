NavigationManager.tsx
import VoiceControlledNavigation from '@/core/components/intelligence/VoiceControlledNavigation';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { Step, useStepNavigation } from '@/core/hooks/useStepNavigation';
import { NotificationPosition } from "@/core/models/data/StatusType";
import PhasesNavigation from '@/core/models/phases/Phase';
import { useNotification } from '@/core/state/context/NotificationContext';
import React, { useEffect, useState } from 'react';
import NavigationMenu from './NavigationMenu';

export type NavigationView = 
  | 'projectManagement'
  | 'socialMedia'
  | 'dashboard'
  | 'project-explorer'
  | 'communication'
  | 'ideation'
  | 'creation'
  | 'launch'
  | 'analysis';

interface NavigationManagerProps {
  initialView?: NavigationView;
  onViewChange?: (view: NavigationView) => void;
  showStepNavigation?: boolean;
}

const NavigationManager: React.FC<NavigationManagerProps> = ({ 
  initialView = 'dashboard',
  onViewChange,
  showStepNavigation = false
}) => {
  const [currentView, setCurrentView] = useState<NavigationView>(initialView);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const { notify, setDuration } = useNotification();

  // Step navigation for guided workflows
  const steps: Step[] = [
    {
      id: 'ideation',
      title: 'Ideation Phase',
      component: () => <div>Ideation Content</div>,
    },
    {
      id: 'creation',
      title: 'Creation Phase', 
      component: () => <div>Creation Content</div>,
    },
    {
      id: 'launch',
      title: 'Launch Phase',
      component: () => <div>Launch Content</div>,
    },
    {
      id: 'analysis',
      title: 'Analysis Phase',
      component: () => <div>Analysis Content</div>,
    }
  ];

  const stepNavigation = useStepNavigation(steps);

  const navigateTo = (newPath: string, view?: NavigationView) => {
    setCurrentPath(newPath);
    
    if (view) {
      setCurrentView(view);
      onViewChange?.(view);
    }

    notify(
      'navigation',
      `Navigated to ${view || newPath}`,
      { path: newPath, view },
      new Date(),
      NotificationTypeEnum.INFO,
      NotificationPosition.TopRight
    );
  };

  const navigateBack = () => {
    // Implement actual history management
    console.log('Navigating back...');
    notify(
      'navigateBack',
      'Navigated back',
      {},
      new Date(),
      NotificationTypeEnum.INFO,
      NotificationPosition.TopRight
    );
  };

  const navigateForward = () => {
    // Implement actual history management  
    console.log('Navigating forward...');
    notify(
      'navigateForward',
      'Navigated forward',
      {},
      new Date(),
      NotificationTypeEnum.INFO,
      NotificationPosition.TopRight
    );
  };

  const handleMenuSelect = (view: string) => {
    navigateTo(`/${view}`, view as NavigationView);
  };

  const handlePhaseNavigation = (phase: string) => {
    navigateTo(`/phases/${phase}`, phase as NavigationView);
  };

  // Auto-navigate based on step changes
  useEffect(() => {
    if (showStepNavigation) {
      const currentStep = steps[stepNavigation.currentStep];
      navigateTo(`/step/${currentStep.id}`, currentStep.id as NavigationView);
    }
  }, [stepNavigation.currentStep, showStepNavigation]);

  return (
    <div className="navigation-manager">
      {/* Main Navigation Controls */}
      <div className="navigation-controls">
        <div className="nav-buttons">
          <button onClick={navigateBack}>← Back</button>
          <button onClick={navigateForward}>Forward →</button>
          <button onClick={() => setDuration(5000)}>Long Notifications</button>
          <button onClick={() => setDuration(3000)}>Normal Notifications</button>
        </div>

        {/* Voice Control */}
        <VoiceControlledNavigation 
          onVoiceCommand={(command: string) => {
            switch(command.toLowerCase()) {
              case 'home': navigateTo('/', 'dashboard'); break;
              case 'projects': navigateTo('/projects', 'projectManagement'); break;
              case 'social': navigateTo('/social', 'socialMedia'); break;
              case 'next': stepNavigation.goToNext(); break;
              case 'previous': stepNavigation.goToPrevious(); break;
            }
          }}
        />
      </div>

      {/* Navigation Menu */}
      <div className="navigation-menu-section">
        <NavigationMenu onSelect={handleMenuSelect} />
      </div>

      {/* Phase Navigation (when in project context) */}
      {(currentView === 'projectManagement' || showStepNavigation) && (
        <div className="phase-navigation-section">
          <PhasesNavigation 
            currentPhase={steps[stepNavigation.currentStep]?.id}
            onPhaseChange={handlePhaseNavigation}
          />
        </div>
      )}

      {/* Step Navigation (for guided workflows) */}
      {showStepNavigation && (
        <div className="step-navigation-section">
          <div className="step-indicator">
            Step {stepNavigation.currentStep + 1} of {steps.length}: {steps[stepNavigation.currentStep]?.title}
          </div>
          <div className="step-controls">
            <button 
              onClick={stepNavigation.goToPrevious}
              disabled={stepNavigation.currentStep === 0}
            >
              Previous
            </button>
            <button 
              onClick={stepNavigation.goToNext}
              disabled={stepNavigation.currentStep === steps.length - 1}
            >
              Next
            </button>
            {stepNavigation.currentStep === steps.length - 1 && (
              <button onClick={() => stepNavigation.submitAll()}>
                Complete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Current State Display */}
      <div className="navigation-status">
        <p><strong>Current View:</strong> {currentView}</p>
        <p><strong>Current Path:</strong> {currentPath}</p>
        {showStepNavigation && (
          <p><strong>Current Step:</strong> {steps[stepNavigation.currentStep]?.title}</p>
        )}
      </div>
    </div>
  );
};

export default NavigationManager;