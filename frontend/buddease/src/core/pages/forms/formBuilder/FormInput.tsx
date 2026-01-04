FormInput.tsx
FormInput.tsx

import InputLabel from '@/core/hooks/userInterface/InputFields';
import { sanitizeInput } from '@/core/models/cypto/SanitizationFunctions';
import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
}

const FormInput: React.FC<FormInputProps> = ({ label, name, value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onChange(name, value);
  };

  // Sanitize input value to prevent XSS attacks
  const sanitizedValue = sanitizeInput(value);

  return (
    <div>
      <InputLabel htmlFor={name}>{label}</InputLabel> {/* Using InputLabel component */}
      <input
        type="text"
        id={name}
        name={name}
        value={sanitizedValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default FormInput;
