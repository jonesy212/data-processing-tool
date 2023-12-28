    // import { useState, useEffect } from 'react';

    // const useVoiceRecognition = () => {
    //   const [isListening, setIsListening] = useState(false);
    //   const [recognizedText, setRecognizedText] = useState('');

    //   useEffect(() => {
    //     const recognition = new window.webkitSpeechRecognition();

    //     recognition.onstart = () => {
    //       setIsListening(true);
    //     };

    //     recognition.onresult = (event) => {
    //       const transcript = event.results[0][0].transcript;
    //       setRecognizedText(transcript);
    //     };

    //     recognition.onend = () => {
    //       setIsListening(false);
    //     };

    //     return () => {
    //       recognition.stop();
    //     };
    //   }, []);

    //   const startListening = () => {
    //     setIsListening(true);
    //     window.webkitSpeechRecognition.start();
    //   };

    //   const stopListening = () => {
    //     setIsListening(false);
    //     window.webkitSpeechRecognition.stop();
    //   };

    //   return {
    //     isListening,
    //     recognizedText,
    //     startListening,
    //     stopListening,
    //   };
    // };

    // export default useVoiceRecognition;
