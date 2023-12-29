// Clipboard.tsx
import React, { useState } from 'react';

interface ClipboardProps {
  onCopy?: (content: string) => void;
  onPaste?: (content: string) => void;
}

const Clipboard: React.FC<ClipboardProps> = ({ onCopy, onPaste }) => {
  const [copiedContent, setCopiedContent] = useState<string>('');

  const copyToClipboard = () => {
    // For simplicity, let's assume we copy the content from a textarea
    const textarea = document.createElement('textarea');
    textarea.value = copiedContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    if (onCopy) {
      onCopy(copiedContent);
    }
  };

  const handlePaste = () => {
    // For simplicity, let's assume we get the content from a textarea
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('paste');
    setCopiedContent(textarea.value);
    document.body.removeChild(textarea);

    if (onPaste) {
      onPaste(textarea.value);
    }
  };

  return (
    <div>
      <button onClick={copyToClipboard}>Copy</button>
      <button onClick={handlePaste}>Paste</button>
    </div>
  );
};

export default Clipboard;
