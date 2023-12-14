// components/Palette.tsx

import React from "react";

export interface ColorSwatchProps {
  key: number;
  color: string;
  style: React.CSSProperties;
}

interface ColorPaletteProps {
  swatches: ColorSwatchProps[]; // Add the swatches prop
}
const ColorPalette: React.FC<ColorPaletteProps> = () => {
  // Define color swatches
  const colorSwatches: ColorSwatchProps[] = [
    {
      key: 0,
      color: "#ff5733",
      style: { backgroundColor: "#ff5733", width: "50px", height: "50px" },
    },
    {
      key: 1,
      color: "#33ff57",
      style: { backgroundColor: "#33ff57", width: "50px", height: "50px" },
    },
    // Add more color swatches as needed
  ];

  return (
    <div>
      <h2>Color Palette</h2>
      {/* Display color swatches with their names */}
      {colorSwatches.map((swatch) => (
        <div key={swatch.key} style={swatch.style}></div>
      ))}
    </div>
  );
};

export default ColorPalette
