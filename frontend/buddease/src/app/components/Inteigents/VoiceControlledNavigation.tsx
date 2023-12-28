// import React, { useEffect, useState } from 'react';
// import IntroJs from 'intro.js';
// import 'intro.js/introjs.css';
// import { startVoiceRecognition, stopVoiceRecognition } from './VoiceControl';

// const VoiceControlledNavigation: React.FC = () => {
//   const [isVoiceRecognitionActive, setVoiceRecognitionActive] = useState(false);

//   useEffect(() => {
//     const intro = IntroJs();

//     intro.setOptions({
//       steps: [
//         {
//           element: '#voiceControlButton',
//           intro: 'Click here to activate voice-controlled navigation.',
//         },
//         // Add more steps as needed.
//       ],
//     });

//     // Start the Intro.js tour when the component mounts
//     intro.start();

//     // Clean up the Intro.js instance when the component unmounts
//     return () => {
//       intro.exit(true);
//     };
//   }, []);

//   const handleVoiceControlToggle = () => {
//     setVoiceRecognitionActive((prev) => !prev);
//   };

//   useEffect(() => {
//     let recognition: SpeechRecognition | undefined;

//     if (isVoiceRecognitionActive) {
//       recognition = startVoiceRecognition((speechResult) => {
//         // Handle speech result, e.g., trigger navigation based on speechResult
//         console.log('Speech Result:', speechResult);
//       });
//     }

//     return () => {
//       stopVoiceRecognition(recognition);
//     };
//   }, [isVoiceRecognitionActive]);

//   return (
//     <div>
//       <button id="voiceControlButton" onClick={handleVoiceControlToggle}>
//         {isVoiceRecognitionActive ? 'Deactivate Voice Control' : 'Activate Voice Control'}
//       </button>
//       {/* Other components related to voice-controlled navigation */}
//     </div>
//   );
// };

// export default VoiceControlledNavigation;
