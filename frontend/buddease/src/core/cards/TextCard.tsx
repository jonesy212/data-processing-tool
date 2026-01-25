// TextCard.tsx
import type { DocumentTypeEnum } from '@/core/server/ServerDocumentGenerator';
import DynamicTextArea from '@/core/ts/DynamicTextArea';
import React, { useState } from 'react';

interface TextCardProps {
  onSave: (text: string) => Promise<void>;
}

const TextCard: React.FC<TextCardProps> = ({ onSave }) => {
  const [text, setText] = useState('');

  const handleSave = async () => {
    try {
      await onSave(text);
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
        isTextCard 
        onEditorStateChange={(newEditorState: any) => {
          setText(newEditorState.getCurrentContent().getPlainText());
        }}
        handleEditorStateChange={(newEditorState: Draft.EditorState) => {
          setText(newEditorState.getCurrentContent().getPlainText());
        }}
        type={DocumentTypeEnum.Text}
      />
    </div>
  );
};

export default TextCard;
