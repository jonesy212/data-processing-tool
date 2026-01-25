// VoiceNavigation.tsx
import React from 'react';
import IntroJs from 'intro.js';

if (typeof window !== 'undefined') {
  import("intro.js/introjs.css");
}
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

    intro.start();

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
