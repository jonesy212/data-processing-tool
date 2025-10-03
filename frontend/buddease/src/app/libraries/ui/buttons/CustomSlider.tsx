import { Slider } from 'antd';
import React, { ChangeEvent, ChangeEventHandler, useState } from 'react';

// Define props interface for CustomSlider
interface CustomSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: ChangeEventHandler<HTMLInputElement>
}

type CustomChangeEvent = ChangeEvent<HTMLInputElement> & ChangeEvent<HTMLInputElement>
const CustomSlider: React.FC<CustomSliderProps> = ({ min, max, value, onChange }) => {
  // State to hold the slider value
  const [sliderValue, setSliderValue] = useState(value);

  // Event handler for slider value change
  const handleSliderChange = (value: number) => {
    setSliderValue(value); // Update local state
    onChange(value as unknown as CustomChangeEvent); // Pass the updated value to the parent component
  };

  return (
    <div>
      {/* Ant Design Slider component */}
      <Slider
        min={min}   // Minimum value
        max={max}   // Maximum value
        value={sliderValue} // Current value
        onChange={handleSliderChange} // Event handler for value change
      />
      {/* Display the slider value */}
      <p>Slider Value: {sliderValue}</p>
    </div>
  );
};

export default CustomSlider;
