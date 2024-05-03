// presetPercentages.ts

import { useState } from "react";

// define the functin to generate preset percentages
export function generatePresetPercentages(numPercentages: number) {
  const percentages: number[] = [];
  for (let i = 0; i < numPercentages; i++) {
    percentages.push((i + 1) * 10);
  }
  return percentages;
}

// define state to hoe the percentages for the presents
export const usePresetPercentages = (initialNumPercentages: number = 5) => {
  const [percentages, setPercentages] = useState(
    generatePresetPercentages(initialNumPercentages)
  );

  const handleNumPercentagesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value);
    setPercentages(generatePresetPercentages(value));
  };
  return {
    percentages,
    handleNumPercentagesChange,
  };
};


