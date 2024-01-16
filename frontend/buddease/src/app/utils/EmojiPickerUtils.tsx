// emojiPickerUtils.ts
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import React, { useEffect, useRef, useState } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [emoji, setEmoji] = useState<string | null>(null);
  const pickerRef = useRef<Picker | null>(null);

  useEffect(() => {
    if (pickerRef.current) {
      pickerRef.current.props.on('emoji', (selectedEmoji: any) => {
        setEmoji(selectedEmoji.native);
      });
    }
  }, []);
  // Render the emoji picker component with additional styling
  return (
    <div>
      <h2>Emoji Picker</h2>
      <div style={{ position: 'absolute', zIndex: 1000 }}>
      <div ref={(node) => (pickerRef.current = node ? new Picker({ onSelect: () => {} }) : null)} />
      </div>
      <button onClick={() => { onSelect(emoji!); onClose(); }}>Close</button>
     </div>
  );
};

// Function to open the emoji picker
export const openEmojiPicker = (onSelect: (emoji: string) => void, onClose: () => void) => {
  // Replace this with the actual logic to render the emoji picker in your UI
  // Example: This is a placeholder, replace it with your actual implementation
  const emojiPicker = <EmojiPicker onSelect={onSelect} onClose={onClose} />;
  document.body.appendChild(emojiPicker as unknown as Node); // Cast emojiPicker to Node before appending
};
