import React from "react";

interface InputProps {
  type: string;
  value: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  inputValue?: string;
  handleInputChange? :(e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface InputLabelProps {
    htmlFor: string; 
    children?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  value,
  onChange,

}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

const InputLabel: React.FC<InputLabelProps> = ({  
   htmlFor, children }) => {
  // Accept children prop
  return <label htmlFor={htmlFor}>{children}</label>; // Render children
};

export default InputLabel;
