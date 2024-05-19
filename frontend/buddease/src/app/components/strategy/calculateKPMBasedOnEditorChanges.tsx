// calculateKPMBasedOnEditorChanges.tsx
import { useEffect, useState } from "react";

// Function to calculate KPM based on editor changes
const calculateKPMBasedOnEditorChanges = (editorState: any) => {
  const [keystrokes, setKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  useEffect(() => {
    // Function to handle editor changes
    const handleEditorChange = () => {
      setKeystrokes(prevKeystrokes => prevKeystrokes + 1);
    };

    // Subscribe to editor change events
    editorState.subscribe(handleEditorChange);

    // Set start time when the component mounts
    setStartTime(Date.now());

    // Unsubscribe from editor change events and reset keystrokes when the component unmounts
    return () => {
      editorState.unsubscribe(handleEditorChange);
      setKeystrokes(0);
    };
  }, [editorState]);

  // Function to calculate KPM
  const calculateKPM = () => {
    if (startTime === null) {
      return 0;
    }
    
    const elapsedTime = (Date.now() - startTime) / 60000; // Convert milliseconds to minutes
    return (keystrokes / elapsedTime).toFixed(2); // Round to 2 decimal places
  };

  return calculateKPM();
};

export default calculateKPMBasedOnEditorChanges;
