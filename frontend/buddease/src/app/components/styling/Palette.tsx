// Palette.tsx
import React from "react";
import { Highlight } from "../documents/NoteData";

import { ColorSwatchProps } from "./ColorPalette";
import ColorPicker from "./ColorPicker";

interface HighlightColor {
  enabled: boolean;
  color: string;
}
interface CustomProperties {
  // Define custom properties here
}

interface TableStyles {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
}

interface Configuration {
  highlight?: {
    enabled: boolean;
    color: string;
  };
  footnote?: {
    enabled: boolean;
    format: string;
  };
  highlightColor: HighlightColor;
  defaultZoomLevel: number;
  customProperties?: CustomProperties;
  tableStyles?: TableStyles;
}

interface PaletteProps {
    colors: string[];
    swatches: ColorSwatchProps[]; // Pass the color swatches as props
    highlights: Highlight[]; // Array of highlight objects
    highlightColor: HighlightColor; // Highlight color settings
  
    onColorChange: (colorIndex: number, newColor: string) => void;
    onAddColor: () => void;
    onRemoveColor: (colorIndex: number) => void;
  }
  
export const Palette: React.FC<PaletteProps> = ({
    colors,
    onColorChange,
    onAddColor,
    onRemoveColor,
  }) => {
    return (
      <div>
        <h3>Color Palette</h3>
        {colors.map((color, index) => (
          <div
            key={index}
            style={{ backgroundColor: color, width: "50px", height: "50px" }}
          >
            <ColorPicker
              color={color}
              onChange={(newColor) => onColorChange(index, newColor)} colorCodingEnabled={false}            />
            <button onClick={() => onRemoveColor(index)}>Remove</button>
          </div>
        ))}
        <button onClick={onAddColor}>Add Color</button>
      </div>
    );
};
  
export type { Configuration, CustomProperties, HighlightColor };

