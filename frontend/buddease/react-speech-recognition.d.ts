// react-speech-recognition.d.ts
declare module "react-speech-recognition" {
    export interface SpeechRecognition {
      startListening: () => void;
      stopListening: () => void;
      abortListening: () => void;
      resetTranscript: () => void;
      browserSupportsSpeechRecognition: () => boolean;
      interimTranscript: string;
      finalTranscript: string;
      listening: boolean;
      supported: boolean;
      transcript: string;
      isMicrophoneAvailable: boolean;
    }
  
    export function useSpeechRecognition(): SpeechRecognition;
  }
  