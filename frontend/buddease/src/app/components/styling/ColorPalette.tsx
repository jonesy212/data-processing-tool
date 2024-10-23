// components/Palette.tsx

import React from "react";

export interface ColorSwatchProps {
  key: number;
  color: string;
  style: React.CSSProperties;
}

interface ColorPaletteProps {
  swatches: ColorSwatchProps[]; // Add the swatches prop
  colorCodingEnabled: boolean; 
  brandingSwatches: ColorSwatchProps[]; // Add brandingSwatches prop
}

  // Define default customizable areas
  // Define dynamic customizable areas
const defaultCustomizableAreas: Record<string, string | Record<string, string>> = {
  "Header": {
    "Background": "",
    "Text Color": "",
    "Logo": "",
  },
  "Main Content": {
    "Background": "",
    "Text Color": "",
  },
  "Sidebar": {
    "Background": "",
    "Text Color": "",
  },
  "Footer": {
    "Background": "",
    "Text Color": "",
  },
  "Link": {
    "Color": "",
  },
  "Button": {
    "Background": "",
    "Text Color": "",
  },
  // Add more detailed areas as needed
};

const ColorPalette: React.FC<ColorPaletteProps> = ({
  swatches,
  colorCodingEnabled,
}) => {
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



  const renderCustomizableAreas = (areas: Record<string, string | Record<string, string>>, depth = 0) => {
    return (
      <div>
        {Object.entries(areas).map(([key, value]) => (
          <div key={key} style={{ marginLeft: `${depth * 20}px` }}>
            {typeof value === 'object' ? (
              <>
                <strong>{key}</strong>
                {renderCustomizableAreas(value as Record<string, string>, depth + 1)}
              </>
            ) : (
              <div>{key}</div>
            )}
          </div>
        ))}
      </div>
    );
  };
  

  return (
    <div>
      <h2>Color Palette</h2>
      {/* Display color swatches with their names */}
      {colorSwatches.map((swatch) => (
        <div key={swatch.key} style={swatch.style}></div>
      ))}

      <h2>Color Palette</h2>
      {/* Display color swatches with their names */}
      {colorCodingEnabled &&
        swatches.map((swatch) => (
          <div key={swatch.key} style={swatch.style}></div>
        ))}

      <h2>Default Customizable Areas</h2>
      {/* Display default customizable areas */}
      {Object.keys(defaultCustomizableAreas).map((area, index) => (
        <div key={index}>{area}</div>
      ))}

      <h2>Color Coding</h2>
      {/* Display color swatches with their names if color coding is enabled */}
      {colorCodingEnabled &&
        swatches.map((swatch) => (
          <div key={swatch.key} style={swatch.style}></div>
        ))}
      

      <h2>Default Customizable Areas</h2>
      {renderCustomizableAreas(defaultCustomizableAreas)}
    
    </div>
  );
};

export default ColorPalette
