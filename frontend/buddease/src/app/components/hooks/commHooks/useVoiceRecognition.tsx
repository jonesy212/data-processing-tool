// useVoiceRecognition.tsx
  import { useSpeechRecognition } from 'react-speech-recognition';

const useVoiceRecognition = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  return {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  };
};

export default useVoiceRecognition;
