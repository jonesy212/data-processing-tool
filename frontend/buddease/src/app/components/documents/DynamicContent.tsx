
// DynamicContent.tsx
import React from 'react';

interface DynamicContentProps {
    fontSize?: string;
    fontFamily?: string;
    content: React.ReactNode;
  }
  
  
  const DynamicContent: React.FC<DynamicContentProps> = ({ fontSize, fontFamily, content }) => {
    const dynamicContentStyle: React.CSSProperties = {
      fontSize,
      fontFamily,
      // Add more dynamic styling as needed
    };
  
    return (
      <div style={dynamicContentStyle}>
        {content}
      </div>
    );
  };
  
export default DynamicContent;
export type { DynamicContentProps };
  