// TextInput.tsx

import useText from '@/app/libraries/animations/DraggableAnimation/useText';
import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange }) => {
  // Destructure the function from the custom hook
  const { beginText } = useText({
    onDragStart: () => {
      console.log('Text drag started');
    },
    onDragMove: (dragX: number, dragY: number) => {
      console.log(`Text dragged by X: ${dragX}, Y: ${dragY}`);
    },
    onDragEnd: () => {
      console.log('Text drag ended');
    },
  });

  // Handle change function for input value
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Enter text"
        onMouseDown={beginText} // Call beginText function on mouse down event
        style={{ cursor: 'move' }} // Set cursor to move when hovering over the input
      />
    </div>
  );
};

export default TextInput;
