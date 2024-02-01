const startVoiceRecognition = (onSpeechResult: (result: string) => void): SpeechRecognition | undefined => {
    const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)() as SpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = false;
  
    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      onSpeechResult(speechResult);
    };
  
    recognition.onend = () => {
      // Handle end of recognition, if needed
    };
  
    recognition.start();
    return recognition;
  };
  
  const stopVoiceRecognition = (recognition: SpeechRecognition | undefined): void => {
    if (recognition) {
      recognition.stop();
    }
  };

  
  
  
  export { startVoiceRecognition, stopVoiceRecognition };
  