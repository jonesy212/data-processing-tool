//RadioButton.tsx

import React from "react";

interface RadioButtonProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  checked,
  onChange,
}) => {
  const handleChange = () => {
    onChange(value);
  };

  return (
    <label className="radio-button-container">
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={handleChange}
      />
      <span className="radio-button"></span>
      {label}
    </label>
  );
};

export default RadioButton;
