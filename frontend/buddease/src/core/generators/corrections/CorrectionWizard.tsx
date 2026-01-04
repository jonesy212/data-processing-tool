CorrectionWizard.tsx
import { CorrectionList } from '@/core/components/lists/CorrectionList';
import { AnalysisStep } from '@/core/components/phases/steps/AnalysisStep';
import { GenericStepContainer } from '@/core/components/shared/steps/GenericStepContainer';
import { CorrectionGenerator } from '@/core/generators/corrections/CorrectionGenerator';
import { useStepNavigation } from '@/core/hooks/useStepNavigation';
import React from 'react';

export const CorrectionWizard: React.FC = () => {
  const handleAnalysisComplete = async () => {
    console.log('Analysis completed, moving to corrections step');
  };

  const handleGenerateReports = async () => {
    const generator = new CorrectionGenerator();
    await generator.generateCorrectionFiles('./corrections');
  };

  const steps = [
    {
      id: 'analysis',
      title: 'Code Analysis',
      component: GenericStepContainer,
      props: {
        title: 'Code Analysis',
        children: <AnalysisStep onNext={handleAnalysisComplete} />,
        onNext: handleAnalysisComplete,
        showNavigation: false // AnalysisStep handles its own navigation
      }
    },
    {
      id: 'corrections', 
      title: 'Suggested Corrections',
      component: GenericStepContainer,
      props: {
        title: 'Suggested Corrections',
        children: <CorrectionList />,
        onNext: () => console.log('Moving to report generation')
      }
    },
    {
      id: 'generate-reports',
      title: 'Generate Correction Reports',
      component: GenericStepContainer,
      props: {
        title: 'Generate Reports',
        children: (
          <div>
            <p>Ready to generate detailed correction reports?</p>
            <p>These markdown files will be saved in your <code>/corrections</code> folder.</p>
            <div className="report-features">
              <h4>Each report includes:</h4>
              <ul>
                <li>📋 Issue summaries and descriptions</li>
                <li>🔧 Step-by-step fix instructions</li>
                <li>📁 File locations and line numbers</li>
                <li>🎯 Priority levels and categories</li>
              </ul>
            </div>
          </div>
        ),
        onNext: handleGenerateReports
      }
    },
    {
      id: 'review-fixes',
      title: 'Review Suggested Fixes',
      component: GenericStepContainer,
      props: {
        title: 'Review Fixes',
        children: (
          <div>
            <p>Open your <code>corrections</code> folder in VS Code.</p>
            <p>View side-by-side with your original files for easy comparison.</p>
            
            <div className="review-tips">
              <h4>Review Tips:</h4>
              <ul>
                <li>✅ Compare suggested changes with your current code</li>
                <li>🧪 Test changes in a development environment first</li>
                <li>📝 Make incremental changes and verify functionality</li>
                <li>🔄 Re-run analysis after applying fixes</li>
              </ul>
            </div>
          </div>
        )
      }
    }
  ];

  const { currentStep, steps: navSteps, goToNext, goToPrevious, stepData } = useStepNavigation(steps);
  const CurrentStep = navSteps[currentStep]?.component;
  const currentProps = navSteps[currentStep]?.props || {};

  return (
    <div className="correction-wizard">
      <div className="wizard-header">
        <h1>🛠️ Code Correction Wizard</h1>
        <div className="wizard-progress">
          <div className="progress-steps">
            {navSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`progress-step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
              >
                <span className="step-number">{index + 1}</span>
                <span className="step-title">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wizard-content">
        {CurrentStep && (
          <CurrentStep
            {...currentProps}
            currentStep={currentStep}
            totalSteps={navSteps.length}
            onNext={goToNext}
            onPrevious={goToPrevious}
            onSubmit={() => console.log('Submit all data:', stepData)}
            stepData={stepData}
          />
        )}
      </div>
    </div>
  );
};