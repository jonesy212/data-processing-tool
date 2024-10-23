// LayoutEditor.tsx
import React from'react';
import DraggableDiv from '@/app/components/libraries/ui/DraggableDiv';
import { useState } from 'react';

const LayoutEditor = ({ elements }) => {
  const [selectedElement, setSelectedElement] = useState(null);

  const handleElementSelect = (element) => {
    setSelectedElement(element);
  };

  return (
    <div>
      <h3>Layout Editor</h3>
      <div style={{ position: 'relative', width: '100%', height: '500px', border: '1px solid #ccc' }}>
        {/* Render draggable divs for each element */}
        {elements.map((element, index) => (
          <DraggableDiv
            key={index}
            element={element}
            onSelect={() => handleElementSelect(element)}
          />
        ))}
      </div>
      <div>
        <p>Selected Element: {selectedElement ? selectedElement.name : 'None'}</p>
        {/* Additional controls or information about the selected element */}
      </div>
    </div>
  );
};

export default LayoutEditor;
