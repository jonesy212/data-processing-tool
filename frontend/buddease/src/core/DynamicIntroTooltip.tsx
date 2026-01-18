// DynamicIntroTooltip.tsx

import React, { useEffect } from 'react';
import type { Step, Options } from 'intro.js';
import IntroJs from 'intro.js';

export interface IntroStep {
  element?: HTMLElement | string;
  intro?: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  tooltipClass?: string;
  highlightClass?: string;
}

interface DynamicIntroTooltipProps {
  steps: Partial<IntroStep>[];
}

const convertToIntroJsSteps = (steps: Partial<IntroStep>[]): Partial<Step>[] => {
  return steps.map(step => {
    const convertedStep: any = { ...step };
    
    if (convertedStep.position === 'auto') {
      delete convertedStep.position;
    }
    
    return convertedStep;
  });
};

const DynamicIntroTooltip: React.FC<DynamicIntroTooltipProps> = ({ steps }) => {
  useEffect(() => {
    const intro = IntroJs();
    
    const introJsSteps = convertToIntroJsSteps(steps);
    
    intro.setOptions({
      steps: introJsSteps,
      tooltipClass: "custom-intro-tooltip",
    } as Options);

    intro.start();

    return () => {
      intro.exit(true);
    };
  }, [steps]);

  return (
    <div>
      {steps.map((step, index) => (
        <div key={index}>{/* Render content for each step here */}</div>
      ))}
    </div>
  );
};

export default DynamicIntroTooltip;



// TODO CREATE a button with the id 
// voiceControlButton that triggers the voice - controlled 
// navigation feature. You would customize the steps and 
// integration points based on your specific application 
// architecture and requirements.





