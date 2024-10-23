import SortCriteria from "@/app/components/settings/SortCriteria";
import React from "react";

interface TaskSort {
    onSort: (criteria: SortCriteria) => void; // Define the onSort callback function
    criteria: SortCriteria; // Define the criteria prop
}

const TaskSortComponent: React.FC<TaskSort> = ({ onSort , criteria}) => {
  const handleSort = (criteria: SortCriteria) => {
    // Call onSort callback with the selected criteria
    onSort(criteria);
  };

  return (
    <div>
      <h4>Sort Tasks By:</h4>
      <button onClick={() => handleSort(SortCriteria.Title)}>Title</button>
      <button onClick={() => handleSort(SortCriteria.Date)}>Date</button>
      <button onClick={() => handleSort(SortCriteria.Priority)}>Priority</button>
      {/* Add more buttons for other sorting criteria */}
    </div>
  );
};

export default TaskSortComponent;
export type { TaskSort };
