// DocumentFormattingOptionsComponent.tsx
import React, { useState } from 'react';

interface DocumentFormattingOptions {
  fontSize: number;
  margin: number;
  textColor: string;
  // Add more formatting options as needed
}

interface DocumentFormattingOptionsComponentProps {
  onChange: (options: DocumentFormattingOptions) => void;
}

const DocumentFormattingOptionsComponent: React.FC<DocumentFormattingOptionsComponentProps> = ({ onChange }) => {
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(20);
  const [textColor, setTextColor] = useState('#000000');

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(e.target.value));
  };

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMargin(Number(e.target.value));
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextColor(e.target.value);
  };

  const handleApplyOptions = () => {
    const options: DocumentFormattingOptions = {
      fontSize,
      margin,
      textColor,
      // Add more formatting options as needed
    };

    onChange(options);
  };

  return (
    <div>
      <h4>Document Formatting Options</h4>
      <label>
        Font Size:
        <input type="number" value={fontSize} onChange={handleFontSizeChange} />
      </label>
      <br />
      <label>
        Margin:
        <input type="number" value={margin} onChange={handleMarginChange} />
      </label>
      <br />
      <label>
        Text Color:
        <input type="color" value={textColor} onChange={handleTextColorChange} />
      </label>
      <br />
      <button onClick={handleApplyOptions}>Apply Options</button>
    </div>
  );
};

export default DocumentFormattingOptionsComponent;
export type { DocumentFormattingOptions };
