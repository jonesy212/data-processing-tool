import OnboardingManager from '@/app/pages/onboarding/OnboardingManager';
import introJs from 'intro.js';
import React, { useEffect } from 'react';

const OnboardingComponent: React.FC = () => {
  useEffect(() => {
    // Initialize Intro.js on component mount
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          element: '#step1',
          intro: 'Welcome to the onboarding tutorial! This is step 1.',
        },
        // Add more steps as needed
      ],
    });
    intro.start();

    // Clean up Intro.js on component unmount
    return () => {
      intro.exit(true);
    };
  }, []);

  return (
    <div>
      <div id="step1">Onboarding Step 1 Content</div>
      <OnboardingManager />
      {/* Add more content and steps */}
    </div>
  );
};

export default OnboardingComponent;
