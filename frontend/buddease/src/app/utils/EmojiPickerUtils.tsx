
import React, { useState } from "react";
import { Picker } from "emoji-mart/react"; // Import Picker from emoji-mart/react
import "emoji-mart/css/emoji-mart.css";

interface EmojiPicker {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  emojiSize: number;
}

export const EmojiPickerComponent: React.FC<EmojiPicker> = ({
  onSelect,
  onClose,
  emojiSize,
}) => {
  const [emoji, setEmoji] = useState<string | null>(null);

  const handleEmojiSelect = (selectedEmoji: any) => {
    // 'selectedEmoji' is of type 'BaseEmoji' from 'emoji-mart'
    setEmoji(selectedEmoji.native);
    onSelect(selectedEmoji.native);
  };

  return (
    <div>
      <h2>Emoji Picker</h2>
      <div style={{ position: "absolute", zIndex: 1000 }}>
        <Picker
          onSelect={handleEmojiSelect}
          emojiSize={emojiSize}
          set="apple"
        />
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export type { EmojiPicker };

export const openEmojiPicker = (
  onSelect: (emoji: string) => void,
  onClose: () => void,
  emojiSize: number
) => {
  const emojiPicker = <EmojiPickerComponent onSelect={onSelect} onClose={onClose} emojiSize={emojiSize} />;
  document.body.appendChild(emojiPicker as unknown as Node);
};
