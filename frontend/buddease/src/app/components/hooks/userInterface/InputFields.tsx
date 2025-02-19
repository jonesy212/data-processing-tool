import React from "react";
import { sanitizeInput } from "../../security/SanitizationFunctions";

interface InputProps {
  id: string;
  type: string;
  value: string;
  placeholder?: string;
  accept?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputValue?: string;
  handleInputChange? :(e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface InputLabelProps {
    htmlFor: string; 
    children?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  id,
  type,
  placeholder,
  value,
  onChange,
  accept,

}) => {

    // Sanitize input value to prevent XSS attacks
    const sanitizedValue = sanitizeInput(value);

  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={sanitizedValue}
      onChange={onChange}
      accept={accept}
    />
  );
};

const InputLabel: React.FC<InputLabelProps> = ({  
   htmlFor, children }) => {
  // Accept children prop
  return <label htmlFor={htmlFor}>{children}</label>; // Render children
};

export default InputLabel;
