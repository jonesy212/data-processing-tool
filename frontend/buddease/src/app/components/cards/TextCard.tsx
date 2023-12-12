// TextCard.tsx
import React, { useState } from 'react';

interface TextCardProps {
  onSave: (text: string) => Promise<void>;
}

const TextCard: React.FC<TextCardProps> = ({ onSave }) => {
  const [text, setText] = useState('');

  const handleSave = async () => {
    try {
      await onSave(text);
      // Optionally, you can reset the text field after successful save
      setText('');
    } catch (error) {
      console.error('Error saving text:', error);
    }
  };

  return (
    <div>
      <h2>Text Card</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default TextCard;
