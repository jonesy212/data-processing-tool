// VoiceControlledNavigation.tsx
import {
    startVoiceRecognition,
    stopVoiceRecognition,
} from "@/core/components/intelligence/VoiceControlledNavigation";
import React, { useEffect, useState } from "react";

if (typeof window !== 'undefined') {
  import("intro.js/introjs.css");
}

const VoiceControlledNavigation: React.FC = () => {
  const [isVoiceRecognitionActive, setVoiceRecognitionActive] = useState(false);

  useEffect(() => {
    intro = new IntroJs(document.body);

    intro.setOptions({
      steps: [
        {
          element: "#voiceControlButton",
          intro: "Click here to activate voice-controlled navigation.",
        },
        // Add more steps as needed.
      ],
    });

    intro.start();

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
        switch (result.toLowerCase()) {
          case "next":
            intro.goToStepNumber(intro._currentStep + 1);
            break;
          case "previous":
            intro.goToStepNumber(intro._currentStep - 1);
            break;
          default:
            console.log("Voice command not recognized");
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
        {isVoiceRecognitionActive
          ? "Deactivate Voice Control"
          : "Activate Voice Control"}
      </button>
      {/* Other components related to voice-controlled navigation */}
    </div>
  );
};

export default VoiceControlledNavigation;
