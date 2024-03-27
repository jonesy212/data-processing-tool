// Dropdown.tsx
import React, { useState } from "react";

const Dropdown = ({ options, selectedOption, onSelectOption }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionSelect = (option) => {
    onSelectOption(option);
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
            <li key={option} onClick={() => handleOptionSelect(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
