// TextBox.tsx

import { Input } from 'antd';
import React from 'react';

interface TextBoxProps {
  value: string;
  onChange: (value: string) => void;
}

const TextBox: React.FC<TextBoxProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder="Enter text"
      // Add other props as needed
    />
  );
};

export default TextBox;
