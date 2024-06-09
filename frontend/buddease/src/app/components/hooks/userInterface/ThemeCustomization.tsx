import React, { SetStateAction } from "react";
import { ThemeConfig } from "../../libraries/ui/theme/ThemeConfig";
import { ThemeState } from "../../state/redux/slices/ThemeSlice";
import { NotificationData } from "../../support/NofiticationsSlice";
import { TableStyle } from "./TableStyle";
interface ThemeCustomizationProps {
  themeState: ThemeConfig;
  infoColor: string;
  setThemeState: React.Dispatch<SetStateAction<ThemeState>>;
  notificationState: React.Dispatch<SetStateAction<NotificationData[]>>;
  tableStyle: TableStyle; // Add the tableStyle property

}

const ThemeCustomization: React.FC<ThemeCustomizationProps> = ({
  themeState,
  setThemeState,
  
}) => {

  // Function to handle primary color change
const handlePrimaryColorChange = (color: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    primaryColor: color,
  }));
};

// Function to handle secondary color change
const handleSecondaryColorChange = (color: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    secondaryColor: color,
  }));
};

// Function to handle theme configuration change
const handleThemeConfigChange = (config: ThemeConfig) => {
  setThemeState((prevState) => ({
    ...prevState,
    themeConfig: config,
  }));
};

// Function to handle font size change
const handleFontSizeChange = (size: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    fontSize: size,
  }));
};

// Function to handle font family change
const handleFontFamilyChange = (family: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    fontFamily: family,
  }));
};

  // Function to save theme settings
  const saveThemeSettings = async () => {
    const themeConfig = {
      primaryColor: themeState.primaryColor,
      secondaryColor: themeState.secondaryColor,
      fontSize: themeState.fontSize,
      fontFamily: themeState.fontFamily,
      headerColor: themeState.headerColor,
      footerColor: themeState.footerColor,
      bodyColor: themeState.bodyColor,
      borderColor: themeState.borderColor,
      borderWidth: themeState.borderWidth,
      borderStyle: themeState.borderStyle,
      padding: themeState.padding,
      margin: themeState.margin,
      brandIcon: themeState.brandIcon,
      brandName: themeState.brandName,
      themeConfig: themeState.themeConfig,
    };

    // Additional logic to save theme settings
    console.log("Theme settings saved");

    // Save theme settings to localStorage
    try {
      localStorage.setItem("themeSettings", JSON.stringify(themeConfig));
      console.log("Theme settings saved to localStorage");
    } catch (error) {
      console.error("Error saving theme settings to localStorage:", error);
    }

    // Save theme settings to API
    try {
      // Assuming you have an API endpoint to save theme settings
      const response = await fetch("api/theme/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any other headers as needed
        },
        body: JSON.stringify(themeConfig),
      });

      if (response.ok) {
        console.log("Theme settings saved to API");
      } else {
        console.error(
          "Failed to save theme settings to API:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error saving theme settings to API:", error);
    }
  };

  // Function to handle header color change
  const handleHeaderColorChange = (color: string) => {
    setThemeState((prevState) => ({
      ...prevState,
      headerColor: color,
    }));
  };
// Function to handle footer color change
const handleFooterColorChange = (color: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    footerColor: color,
  }));
};

// Function to handle body color change
const handleBodyColorChange = (color: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    bodyColor: color,
  }));
};

// Function to handle border color change
const handleBorderColorChange = (color: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    borderColor: color,
  }));
};

// Function to handle border width change
const handleBorderWidthChange = (width: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    borderWidth: width,
  }));
};

// Function to handle border style change
const handleBorderStyleChange = (style: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    borderStyle: style,
  }));
};

// Function to handle padding change
const handlePaddingChange = (padding: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    padding: padding,
  }));
};

// Function to handle margin change
const handleMarginChange = (margin: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    margin: margin,
  }));
};

// Function to handle brand icon change
const handleBrandIconChange = (icon: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    brandIcon: icon,
  }));
};

// Function to handle brand name change
const handleBrandNameChange = (name: string) => {
  setThemeState((prevState) => ({
    ...prevState,
    brandName: name,
  }));
};


  // Add UI elements for other theme settings
  const themeSettings = {
    headerColor: {
      label: "Header Color",
      value: themeState.headerColor,
      onChange: handleHeaderColorChange,
    },
    footerColor: {
      label: "Footer Color",
      value: themeState.footerColor,
      onChange: handleFooterColorChange,
    },
    bodyColor: {
      label: "Body Color",
      value: themeState.bodyColor,
      onChange: handleBodyColorChange,
    },
    borderColor: {
      label: "Border Color",
      value: themeState.borderColor,
      onChange: handleBorderColorChange,
    },
    borderWidth: {
      label: "Border Width",
      value: themeState.borderWidth,
      onChange: handleBorderWidthChange,
    },
    borderStyle: {
      label: "Border Style",
      value: themeState.borderStyle,
      onChange: handleBorderStyleChange,
    },
    padding: {
      label: "Padding",
      value: themeState.padding,
      onChange: handlePaddingChange,
    },
    margin: {
      label: "Margin",
      value: themeState.margin,
      onChange: handleMarginChange,
    },
    brandIcon: {
      label: "Brand Icon",
      value: themeState.brandIcon,
      onChange: handleBrandIconChange,
    },
    brandName: {
      label: "Brand Name",
      value: themeState.brandName,
      onChange: handleBrandNameChange,
    },
    themeConfig: {
      label: "Theme Configuration",
      value: themeState.themeConfig,
      onChange: handleThemeConfigChange,
    },
  };

  return (
    <div>
      <h2>Theme Customization</h2>
      {/* Render UI elements for primary color, secondary color, font size, and font family */}
      {/* Primary Color */}
      <label>
        Primary Color:
        <input
          type="color"
          value={themeState.primaryColor}
          onChange={(e) => handlePrimaryColorChange(e.target.value)}
        />
      </label>
      {/* Secondary Color */}
      <label>
        Secondary Color:
        <input
          type="color"
          value={themeState.secondaryColor}
          onChange={(e) => handleSecondaryColorChange(e.target.value)}
        />
      </label>
      {/* Font Size */}
      <label>
        Font Size:
        <input
          type="text"
          value={themeState.fontSize}
          onChange={(e) => handleFontSizeChange(e.target.value)}
        />
      </label>
      {/* Font Family */}
      <label>
        Font Family:
        <input
          type="text"
          value={themeState.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
        />
      </label>
  
      {/* Render UI elements for other theme settings */}
      {Object.entries(themeSettings).map(([key, setting]) => (
        <label key={key}>
          {setting.label}:
          <input
            type="text"
            value={setting.value?.toString() || ""}
            onChange={(e) => setting.onChange(e.target.value as never)}
          />
        </label>
      ))}
  
      {/* Save button */}
      <button onClick={saveThemeSettings}>Save Theme Settings</button>
    </div>
  );
}  



const defaultThemeConfig: ThemeConfig = {
  infoColor: "#17a2b8", // Blue
  primaryColor: "#007bff", // Blue
  secondaryColor: "#6c757d", // Gray
  fontSize: "16px", // Default font size
  fontFamily: "Arial, sans-serif", // Default font family
  headerColor: "#ffffff", // White
  footerColor: "#f8f9fa", // Light Gray
  bodyColor: "#f8f9fa", // Light Gray
  borderColor: "#ced4da", // Light Gray
  borderWidth: 1, // Default border width
  borderStyle: "solid", // Default border style
  padding: "10px", // Default padding
  margin: "20px", // Default margin
  brandIcon: "", // Default empty string for brand icon
  brandName: "My Brand", // Default brand name
  successColor: "#28a745", // Green
  warningColor: "#ffc107", // Yellow
  dangerColor: "#dc3545", // Red
  infoTextColor: "#ffffff", // White
  themeConfig: {
    infoColor: "#007bff", // Blue
 
  }, // Default empty object for theme configuration
};

export default ThemeCustomization;
export type { ThemeCustomizationProps };

export {defaultThemeConfig}