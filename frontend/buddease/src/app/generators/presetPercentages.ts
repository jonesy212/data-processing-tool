import { useState } from "react";

// Define the function to generate preset percentages
export function generatePresetPercentages(
  numPercentages: number,
  presetPercentages: number[] = []
): number[] {
  // If presetPercentages are provided and their length matches numPercentages, use them.
  if (presetPercentages.length === numPercentages) {
    return presetPercentages;
  }

  // Generate default percentages if presetPercentages are not provided
  const percentages: number[] = [];
  for (let i = 0; i < numPercentages; i++) {
    percentages.push((i + 1) * 10);
  }
  return percentages;
}

// Define the hook to hold the percentages for the presets
export const usePresetPercentages = (initialNumPercentages: number = 5) => {
  const [percentages, setPercentages] = useState<number[]>(
    generatePresetPercentages(initialNumPercentages)
  );

  const handleNumPercentagesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value, 10);
    setPercentages(generatePresetPercentages(value));
  };

  return {
    percentages,
    handleNumPercentagesChange,
    
  };
};
