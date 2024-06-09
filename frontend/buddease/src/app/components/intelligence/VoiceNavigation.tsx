import React from "react";
import IntroJs from 'intro.js';
import 'intro.js/introjs.css';
import { useEffect } from 'react';

const VoiceControlledNavigation = () => {
  useEffect(() => {
    const intro =   IntroJs();
    
    intro.setOptions({
      steps: [
        {
          element: '#voiceControlButton',
          intro: 'Click here to activate voice-controlled navigation.',
        },
        // Add more steps as needed.
      ],
    });

    // Start the Intro.js tour when the component mounts
    intro.start();

    // Clean up the Intro.js instance when the component unmounts
    return () => {
      intro.exit(true);
    };
  }, []);

  return (
    <div>
      <button id="voiceControlButton">Activate Voice Control</button>
      {/* Other components related to voice-controlled navigation */}
    </div>
  );
};

export default VoiceControlledNavigation;
