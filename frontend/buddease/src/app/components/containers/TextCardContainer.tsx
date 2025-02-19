// TextContainer.tsx
import React from 'react';
import TextCard from '../cards/TextCard';

const TextContainer: React.FC = () => {
  const handleSaveText = async (text: string) => {
    // Simulate an asynchronous operation, e.g., saving to a database
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Text saved:', text);
        resolve();
      }, 1000);
    });
  };

  return (
    <div>
      <h1>Text Container</h1>
      <TextCard onSave={handleSaveText} />
    </div>
  );
};

export default TextContainer;
