// components/PaletteManager.tsx
import React, { useState } from "react";
import { Palette } from "./Palette";

interface ColorPalette {
  name: string;
  colors: string[];
}

const PaletteManager: React.FC = () => {
  const [palettes, setPalettes] = useState<ColorPalette[]>([
    {
      name: "Default Palette",
      colors: ["#ff5733", "#33ff57", "#3366ff", "#ff33cc"],
    },
  ]);

  const addColor = (paletteIndex: number) => {
    const updatedPalettes = [...palettes];
    updatedPalettes[paletteIndex].colors.push("#ffffff");
    setPalettes(updatedPalettes);
  };

  const removeColor = (paletteIndex: number, colorIndex: number) => {
    const updatedPalettes = [...palettes];
    updatedPalettes[paletteIndex].colors.splice(colorIndex, 1);
    setPalettes(updatedPalettes);
  };

  const updateColor = (
    paletteIndex: number,
    colorIndex: number,
    newColor: string
  ) => {
    const updatedPalettes = [...palettes];
    updatedPalettes[paletteIndex].colors[colorIndex] = newColor;
    setPalettes(updatedPalettes);
  };

  const addPalette = () => {
    const newPalette: ColorPalette = {
      name: `Palette ${palettes.length + 1}`,
      colors: [],
    };
    setPalettes([...palettes, newPalette]);
  };

  return (
    <div>
      <h2>Palette Manager</h2>
      {palettes.map((palette, index) => (
        <div key={index}>
          <h3>{palette.name}</h3>
          <Palette
            colors={palette.colors}
            swatches={palette.colors.map((color, colorIndex) => ({
              key: colorIndex,
              color,
              style: { backgroundColor: color },
            }))}
            onColorChange={(colorIndex, newColor) =>
              updateColor(index, colorIndex, newColor)
            }
            onAddColor={() => addColor(index)}
            onRemoveColor={(colorIndex) => removeColor(index, colorIndex)}
          />
        </div>
      ))}
      <button onClick={addPalette}>Add Palette</button>
    </div>
  );
};

export default PaletteManager;
