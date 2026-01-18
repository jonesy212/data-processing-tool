// ColorPicker.tsx
import { validateHexColor } from "@/core/libraries/ui/theme/ThemeConfig";
import React from "react";
import { ChromePicker } from "react-color";
import type { ColorResult } from "react-color";


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
    const validatedColor = validateHexColor(newColor.hex);
    onChange(validatedColor);
  };

  return (
    <div>
      <ChromePicker color={color} onChange={handleColorChange} />
      {colorCodingEnabled && (
        <ChromePicker
          color={color}
          onChange={(newColor) => {
            const validatedColor = validateHexColor(newColor.hex);
            onChange(validatedColor);
          }}
        />
      )}
    </div>
  );
};

export default ColorPicker;
