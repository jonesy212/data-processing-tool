// DynamicTextArea.tsx
import React from "react";

interface DynamicTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
    name?: any;
    required?: boolean;
}
// todo verify if i need to add memo here for the input
const DynamicTextArea: React.FC<DynamicTextAreaProps> = ({
  name,
  value,
  onChange,
  placeholder,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ width: "100%", minHeight: "100px" }}
    />
  );
};

export default DynamicTextArea;
