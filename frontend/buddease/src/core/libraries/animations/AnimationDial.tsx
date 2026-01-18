// AnimationDial.tsx
import React, { useState } from 'react';

interface DialProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (newValue: number) => void;
}

const AnimationDial: React.FC<DialProps> = ({ label, min, max, value, onChange }) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setInternalValue(newValue);
    onChange(newValue);
  };

  return (
    <div>
      <label>{label}</label>
      <input type="range" min={min} max={max} value={internalValue} onChange={handleChange} />
      <span>{internalValue}</span>
    </div>
  );
};

export default AnimationDial;
