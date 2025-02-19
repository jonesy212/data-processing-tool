// components/DynamicColorPalette.tsx
import React from 'react';
import ColorPalette, { ColorSwatchProps } from './ColorPalette';

interface DynamicColorPaletteProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
  colorCodingEnabled: boolean; 
  brandingSwatches: ColorSwatchProps[]; // Add brandingSwatches prop
  colors: ColorSwatchProps[]; 
}

const DynamicColorPalette: React.FC<DynamicColorPaletteProps> = ({
  dynamicContent,
  colorCodingEnabled,
  colors, 
}) => {
  // Dynamic generation of color swatches
  const dynamicColorSwatches: ColorSwatchProps[] = [
    "#ff5733",
    "#33ff57",
    "#3366ff",
    "#ff33cc",
  ].map((color, index) => ({
    key: index,
    color,
    style: { backgroundColor: color, width: "50px", height: "50px" },
  }));

  return (
    <div>
      <h1>{dynamicContent ? "Dynamic" : "Static"} Color Palette</h1>
      <ColorPalette
        swatches={dynamicContent ? colors : staticColorSwatches}
        colorCodingEnabled={colorCodingEnabled} brandingSwatches={[]}
      />
    </div>
  );
};




const staticColorSwatches: ColorSwatchProps[] = [
  { key: 0, color: '#ff5733', style: { backgroundColor: '#ff5733', width: '50px', height: '50px' } },
  { key: 1, color: '#33ff57', style: { backgroundColor: '#33ff57', width: '50px', height: '50px' } },
  { key: 2, color: '#3366ff', style: { backgroundColor: '#3366ff', width: '50px', height: '50px' } },
  { key: 3, color: '#ff33cc', style: { backgroundColor: '#ff33cc', width: '50px', height: '50px' } },
];

export default DynamicColorPalette;
