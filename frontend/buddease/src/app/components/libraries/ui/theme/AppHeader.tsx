// Example of applying branding in a React component using a Theme provider
import { useContext } from 'react';
import { ThemeContext } from './Theme';
import React from "react";

const AppHeader: React.FC = () => {
  const theme = useContext(ThemeContext);

  // Check if theme is null, and provide default values if it is
  const primaryColor = theme?.primaryColor || '#3498db';
  const secondaryColor = theme?.secondaryColor || '#e74c3c';
  const font = theme?.font || 'Arial, sans-serif';
  
return (
    <header style={{ backgroundColor: primaryColor, color: secondaryColor, fontFamily: font }}>
      {/* Header content */}
    </header>
  );
};
