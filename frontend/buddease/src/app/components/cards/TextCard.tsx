// TextCard.tsx
import DynamicTextArea from '@/app/ts/DynamicTextArea';
import React, { useState } from 'react';
import { ToolbarOptions } from '../documents/ToolbarOptions';

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
      <DynamicTextArea
        value={text}
        onChange={(newText) => setText(newText)}
        placeholder="Enter text here"
      />
      <button onClick={handleSave}>Save</button>
      <ToolbarOptions
        isTextCard onEditorStateChange={function (newEditorState: any): void {
          setText(newEditorState.getCurrentContent().getPlainText());
                }}
        handleEditorStateChange={function (newEditorState: Draft.EditorState): void {
          setText(newEditorState.getCurrentContent().getPlainText());
        } }      />

    </div>
  );
};

export default TextCard;
