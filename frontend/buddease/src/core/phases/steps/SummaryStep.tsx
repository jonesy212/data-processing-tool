// SummaryStep.tsx
// Generic Summary Step Component
import React from "react";


const SummaryStep: React.FC<{
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title: string; data: any
}> = ({ title, data }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>Basic Information:</p>
      <ul>
        {/* Dynamically render basic info fields */}
        {Object.entries(data.basicInfo).map(([key, value]) => (
          <li key={key}>{key}: {String(value)}</li>
        ))}
      </ul>
      <p>Members:</p>
      <ul>
        {/* Render members */}
        {data.members.map((member: string, index: number) => (
          <li key={index}>{member}</li>
        ))}
      </ul>
      <p>Preferences:</p>
      <ul>
        {/* Dynamically render preferences */}
        {Object.entries(data.preferences).map(([key, value]) => (
          <li key={key}>{key}: {String(value)}</li>
        ))}
      </ul>
    </div>
  );
};

export default SummaryStep