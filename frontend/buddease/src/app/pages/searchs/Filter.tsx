// Filter.tsx
import React, { useState } from 'react';
import { SortingOption } from './SearchOptions';

interface Filter {
  label: string;
  options: string[]; // Options for the filter
  onChange: (selectedOption: SortingOption | undefined, field: string) => void; // Adjusted onChange function
  field: string;
  defaultValue?: string; // Default value for the filter
  disabled?: boolean; // Whether the filter is disabled or not
  className?: string; // Additional CSS class name for styling purposes
  id?: string; // HTML id attribute for the filter element
  style?: React.CSSProperties; // Inline styles for the filter component
  required?: boolean; // Whether the filter is required or not
  autoFocus?: boolean; // Whether the filter should receive focus automatically
  multiple?: boolean; // Whether the filter should allow multiple selections
  placeholder?: string; // Placeholder text for the filter input/select

}

const FilterComponent: React.FC<Filter> = ({ label, options, onChange, field }) => {
  const [selectedOption, setSelectedOption] = useState<string>(''); // State to track the selected option

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue); // Update the selected option in state
    const parsedOption = selectedValue === "" ? undefined : mapToSortingOption(selectedValue);
    onChange(parsedOption, field); // Adjusted call to onChange
  };

  // Helper function to map string value to SortingOption
  const mapToSortingOption = (value: string): SortingOption | undefined => {
    // Implement logic to map string value to SortingOption
    // For simplicity, assuming value is the field name
    return { field: value, order: "asc" }; // Example mapping
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

export default FilterComponent;
export type { Filter };

