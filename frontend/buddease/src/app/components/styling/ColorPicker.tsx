// components/ColorPicker.tsx
import React from "react";
import { ChromePicker, ColorResult } from "react-color";

interface ColorPickerProps {
  color: string;
  onChange: (newColor: string) => void;
  colorCodingEnabled: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  colorCodingEnabled,
}) => {
  const handleColorChange = (newColor: ColorResult) => {
    onChange(newColor.hex);
  };

  return (
    <div>
      <ChromePicker color={color} onChange={handleColorChange} />
      {colorCodingEnabled && (
        <ChromePicker
          color={color}
          onChange={(newColor) => onChange(newColor.hex)}
        />
      )}
    </div>
  );
};

export default ColorPicker;
