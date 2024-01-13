// ThemeCustomization.tsx
import React from "react";
import { useThemeConfig } from "./ThemeConfigContext";

const ThemeCustomization: React.FC = () => {
  const {
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
  } = useThemeConfig();

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
  };

  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
  };

  return (
    <div>
      <h2>Theme Customization</h2>
      <label>
        Primary Color:
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => handlePrimaryColorChange(e.target.value)}
        />
      </label>
      <label>
        Secondary Color:
        <input
          type="color"
          value={secondaryColor}
          onChange={(e) => handleSecondaryColorChange(e.target.value)}
        />
      </label>
      <label>
        Font Size:
        <input
          type="text"
          value={fontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
        />
      </label>
      <label>
        Font Family:
        <input
          type="text"
          value={fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
        />
      </label>
    </div>
  );
};

export default ThemeCustomization;
