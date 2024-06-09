// ElementSelector.tsx
import { useState } from 'react';
import React from "react";

const ElementSelector = ({ onSelect }) => {
  const [selectedElement, setSelectedElement] = useState('');

  const handleElementSelect = (element) => {
    setSelectedElement(element);
    onSelect(element);
  };

  return (
    <div>
      <h3>Select Element Type:</h3>
      <button onClick={() => handleElementSelect('text')}>Text Box</button>
      <button onClick={() => handleElementSelect('image')}>Image</button>
      <button onClick={() => handleElementSelect('video')}>Video</button>
      {/* Add more options for other types of elements as needed */}
      <p>Selected Element: {selectedElement}</p>
    </div>
  );
};

export default ElementSelector;
