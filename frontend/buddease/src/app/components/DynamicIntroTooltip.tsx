//TODO: IMPlEMENTATION IN MOBX AN INTRO TIP
// DynamicIntroTooltip.tsx
import IntroJs from 'intro.js';
import { IntroStep } from 'intro.js/src/core/steps';

import React, { useEffect } from 'react';
var PropTypes = require('prop-types');

interface DynamicIntroTooltipProps {
  steps: Partial<IntroStep>[];
}

const DynamicIntroTooltip: React.FC<DynamicIntroTooltipProps> = ({ steps }) => {
  useEffect(() => {
    const intro = IntroJs(document.body);

    intro.setOptions({
      steps,
      tooltipClass: "custom-intro-tooltip",
    });

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

DynamicIntroTooltip.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      element: PropTypes.string.isRequired,
      intro: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DynamicIntroTooltip;




//TODO CREATE a button with the id 
// voiceControlButton that triggers the voice - controlled navigation feature.You would customize the steps and integration points based on your specific application architecture and requirements.





