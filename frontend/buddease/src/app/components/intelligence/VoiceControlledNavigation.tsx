import 'intro.js/introjs.css';
import { IntroJs } from 'intro.js/src/intro';
import React, { useEffect, useState } from 'react';
import { startVoiceRecognition, stopVoiceRecognition } from './VoiceControl';

  const VoiceControlledNavigation: React.FC = () => {
    const [isVoiceRecognitionActive, setVoiceRecognitionActive] = useState(false);
  
    useEffect(() => {
      intro = new IntroJs(document.body);
  
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
  
    let intro: IntroJs;
  
    const handleVoiceControlToggle = () => {
      setVoiceRecognitionActive((prev) => !prev);
    };
  
    useEffect(() => {
      let recognition: SpeechRecognition | undefined;
  
      if (isVoiceRecognitionActive) {
        recognition = startVoiceRecognition((result: string) => {
          console.log(result);
  
          // Handle voice commands
          switch(result.toLowerCase()) {
            case 'next':
              intro.goToStepNumber(intro._currentStep + 1);
              break;
            case 'previous':
              intro.goToStepNumber(intro._currentStep - 1);
              break;
            default:
              console.log('Voice command not recognized');
          }
        });
      }
  
      return () => {
        stopVoiceRecognition(recognition);
      };
    }, [isVoiceRecognitionActive]);
  

  return (
    <div>
      <button id="voiceControlButton" onClick={handleVoiceControlToggle}>
        {isVoiceRecognitionActive ? 'Deactivate Voice Control' : 'Activate Voice Control'}
      </button>
      {/* Other components related to voice-controlled navigation */}
    </div>
  );
};

export default VoiceControlledNavigation;
