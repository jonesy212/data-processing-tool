// TaskFilter.tsx
import React, { useState } from 'react';

interface TaskFilter {
    onChange: (selectedOption: string) => void;
    
}

const TaskFilterComponent: React.FC<TaskFilter> = ({ onChange }) => {
  const [selectedOption, setSelectedOption] = useState<string>(''); // State to track the selected option

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedOption(selectedValue); // Update the selected option in state
    onChange(selectedValue); // Call the onChange callback with the selected option
  };

  return (
    <div>
      <label htmlFor="taskFilter">Task Filter</label>
      <select id="taskFilter" value={selectedOption} onChange={handleChange}>
        <option value="">Select Task Filter</option>
        <option value="priority">Priority</option>
        <option value="status">Status</option>
        {/* Add more options as needed */}
      </select>
    </div>
  );
};

export default TaskFilterComponent;
export type { TaskFilter };

