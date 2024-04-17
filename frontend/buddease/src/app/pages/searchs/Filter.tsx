// Filter.tsx
import React, { useState } from 'react';

interface FilterProps {
  label: string;
  options: string[]; // Options for the filter
  onChange: (selectedOption: string) => void;
}

const Filter: React.FC<FilterProps> = ({ label, options, onChange }) => {
  const [selectedOption, setSelectedOption] = useState<string>(''); // State to track the selected option

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue); // Update the selected option in state
    onChange(selectedValue); // Call the onChange callback with the selected option
  };

  return (
    <div>
      <label htmlFor={label}>{label}</label>
      <select id={label} value={selectedOption} onChange={handleChange}>
        <option value="">Select {label}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filter;
