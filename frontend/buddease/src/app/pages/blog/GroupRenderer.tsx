// GroupRenderer.tsx
import React from 'react';

interface GroupRendererProps {
  groups: JSX.Element[][]; // Each group contains an array of JSX elements
}

const GroupRenderer: React.FC<GroupRendererProps> = ({ groups }) => {
  return (
    <div>
      {groups.map((group, index) => (
        <div key={index} className="group">
          {group.map((item, itemIndex) => (
            <div key={itemIndex} className="item">
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GroupRenderer;
