// FormInputComponent.tsx
import React, { useCallback } from 'react';

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInputComponent: React.FC<FormInputProps> = React.memo(
  ({ label, type, value, onChange }) => {
    //todo update to use 
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
      },
      [onChange]
    );

    return (
      <div>
        <label htmlFor={label}>{label}</label>
        <input type={type} id={label} value={value} onChange={onChange} />
      </div>
    );
  }
);

export default FormInputComponent;
