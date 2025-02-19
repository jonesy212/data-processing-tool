import React, { useState } from 'react';

interface TraderTypesSelectionProps {
  onSelect: (type: string) => void;
}

const TraderTypesSelection: React.FC<TraderTypesSelectionProps> = ({ onSelect }) => {
  // State to track the selected trader type
  const [selectedType, setSelectedType] = useState<string>('');

  // Function to handle the selection of trader type
  const handleSelect = (type: string) => {
    setSelectedType(type); // Update the selected trader type
    onSelect(type); // Pass the selected type to the parent component
  };

  return (
    <div>
      <h3>Trader Types Selection</h3>
      <p>Please select your trader type:</p>
      <div>
        <label>
          <input
            type="radio"
            value="Scalp Trader"
            checked={selectedType === 'Scalp Trader'}
            onChange={() => handleSelect('Scalp Trader')}
          />
          Scalp Trader
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="Day Trader"
            checked={selectedType === 'Day Trader'}
            onChange={() => handleSelect('Day Trader')}
          />
          Day Trader
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            value="Swing Trader"
            checked={selectedType === 'Swing Trader'}
            onChange={() => handleSelect('Swing Trader')}
          />
          Swing Trader
        </label>
      </div>
    </div>
  );
};

export default TraderTypesSelection;
