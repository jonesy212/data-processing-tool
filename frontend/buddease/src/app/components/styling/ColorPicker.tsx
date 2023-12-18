// components/ColorPicker.tsx
import React from 'react';
import { ChromePicker, ColorResult } from 'react-color';

interface ColorPickerProps {
  color: string;
  onChange: (newColor: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const handleColorChange = (newColor: ColorResult) => {
    onChange(newColor.hex);
  };

  return (
    <div>
      <ChromePicker color={color} onChange={handleColorChange} />
    </div>
  );
};

export default ColorPicker;
