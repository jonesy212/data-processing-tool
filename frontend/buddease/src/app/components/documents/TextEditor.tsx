import { useEffect, useState } from 'react';

const TextEditor = () => {
  const [text, setText] = useState('');
  const [isAllCaps, setIsAllCaps] = useState(false);

  useEffect(() => {
    const handleKeyboardShortcuts = (event:any) => {
      // Check for specific key combinations
      if (event.ctrlKey && event.key === 't') {
        // Ctrl+T pressed, toggle between all caps and lower case
        setIsAllCaps((prevIsAllCaps) => !prevIsAllCaps);
      }
    };

    // Attach the event listener when the component mounts
    window.addEventListener('keydown', handleKeyboardShortcuts);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, []); // Empty dependency array ensures the effect runs only once on mount

  const handleTextChange = (event:any) => {
    const newText = isAllCaps ? event.target.value.toUpperCase() : event.target.value.toLowerCase();
    setText(newText);
  };

  return (
    <div>
      <textarea value={text} onChange={handleTextChange} />
    </div>
  );
};

export default TextEditor;
