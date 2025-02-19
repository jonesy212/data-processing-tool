import React from "react";
// BudgetDistributionComponent.tsx
import { usePresetPercentages } from "@/app/generators/presetPercentages";
import type {} from "react";

// Define the list of departments
const departments = ["Marketing", "R&D", "HR", "Operations", "Sales"];

const BudgetDistributionComponent: React.FC = () => {
  const { percentages, handleNumPercentagesChange } = usePresetPercentages(departments.length);

  return (
    <div>
      <h2>Budget Distribution</h2>
      <input
        type="number"
        onChange={handleNumPercentagesChange}
        placeholder="Enter number of departments"
        min="1"
        max={departments.length}
      />
      <ul>
        {percentages.map((percentage, index) => (
          <li key={index}>
            {departments[index] || `Department ${index + 1}`}: {percentage.toFixed(2)}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BudgetDistributionComponent;
