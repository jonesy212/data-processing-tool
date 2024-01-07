import { ColorSwatchProps } from "./ColorPalette";
import ColorPicker from "./ColorPicker";


interface PaletteProps {
    colors: string[];
    swatches: ColorSwatchProps[]; // Pass the color swatches as props

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
  