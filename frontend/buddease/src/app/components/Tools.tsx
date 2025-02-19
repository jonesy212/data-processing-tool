// components/Tools.tsx
import React from 'react';

interface ToolsProps {
  tools: string[];
}

const Tools: React.FC<ToolsProps> = ({ tools }) => {
  return (
    <div>
      <h2>Tools Used</h2>
      <ul>
        {tools.map((tool, index) => (
          <li key={index}>{tool}</li>
        ))}
      </ul>
    </div>
  );
};

export default Tools;
