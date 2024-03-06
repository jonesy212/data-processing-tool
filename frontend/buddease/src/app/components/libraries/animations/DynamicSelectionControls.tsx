import React, { useState } from 'react';

interface Option {
  label: string;
  value: string;
}

interface DynamicSelectionControlsProps {
  options: Option[];
  controlType: 'checkbox' | 'radio' | 'select' | 'toggle';
}

const DynamicSelectionControls: React.FC<DynamicSelectionControlsProps> = ({
  options,
  controlType,
}) => {
  const [selectedValue, setSelectedValue] = useState<
    string | string[] | boolean
  >(controlType === "checkbox" ? [] : "");

  const handleSelectionChange = (value: string | boolean) => {
    setSelectedValue((prevValue) => {
      if (controlType === "checkbox") {
        // Toggle checkbox selection
        const updatedSelection = [...(prevValue as string[])];
        const index = updatedSelection.indexOf(value as string);
        if (index === -1) {
          updatedSelection.push(value as string);
        } else {
          updatedSelection.splice(index, 1);
        }
        return updatedSelection;
      } else if (controlType === "toggle") {
        return value as boolean;
      } else {
        // Update radio, select selection
        return value as string;
      }
    });
  };

  return (
    <div>
      <h2>Dynamic Selection Controls</h2>
      {controlType === "checkbox" ? (
        options.map((option, index) => (
          <div key={index}>
            <label>
              <input
                type="checkbox"
                checked={(selectedValue as string[]).includes(option.value)}
                onChange={() => handleSelectionChange(option.value)}
              />
              {option.label}
            </label>
          </div>
        ))
      ) : controlType === "radio" ? (
        options.map((option, index) => (
          <div key={index}>
            <label>
              <input
                type="radio"
                value={option.value}
                checked={selectedValue === option.value}
                onChange={() => handleSelectionChange(option.value)}
              />
              {option.label}
            </label>
          </div>
        ))
      ) : controlType === "select" ? (
        <select
          value={selectedValue as string}
          onChange={(e) => handleSelectionChange(e.target.value)}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : controlType === "toggle" ? (
        <label>
          Toggle Switch
          <input
            type="checkbox"
            checked={selectedValue as boolean}
            onChange={() => handleSelectionChange(!selectedValue)}
          />
        </label>
      ) : null}
      <div>
        <h3>Selected Value:</h3>
        <pre>{JSON.stringify(selectedValue, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DynamicSelectionControls;
export type {Option}