// Dropdown.tsx
import React, { useState } from "react";
import { Option } from "../animations/DynamicSelectionControls";
interface DropDownProps {
  options: string[];
  selectedOption: string;
  onSelectOption: (option: string) => void;
}
const Dropdown: React.FC<DropDownProps> = ({
  options,
  selectedOption,
  onSelectOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionSelect = (option: Option) => {
    onSelectOption(String(option));
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container">
      <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
        {selectedOption}
      </div>
      {isOpen && (
        <ul className="dropdown-options">
          {options.map((option) => (
            <li
              key={option}
              onClick={() =>
                handleOptionSelect({ value: option, label: option })
              }
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
