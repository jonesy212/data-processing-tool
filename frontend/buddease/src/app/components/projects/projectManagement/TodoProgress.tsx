// TodoProgress.tsx
import ListGenerator from "@/app/generators/ListGenerator";
import React from "react";
import { Data } from "../../models/data/Data";
import { DetailsItem } from "../../state/stores/DetailsListStore";
import { Todo } from "../../todos/Todo";

interface TodoProgressProps {
  todoProgress: DetailsItem<Data>[]; // Ensure DetailsItem type is imported and defined correctly
  newProgress: number; // Add newProgress prop
  selectedTodo: Todo;
  onUpdateProgress: (todo: Todo, newProgress: number) => void; // Update function signature
  onTodoClick: (todoId: Todo) => void;
  
}

const TodoProgress: React.FC<TodoProgressProps> = ({
  todoProgress,
  selectedTodo,
  newProgress,
  onUpdateProgress,
  onTodoClick,
}) => {
  const handleUpdateProgress = () => {
    onUpdateProgress(selectedTodo, newProgress); // Pass both todo and newProgress
  };

  const handleTodoClick = () => {
    if (selectedTodo) {
      onTodoClick(selectedTodo);
    }
  };
  return (
    <div>
      <h3>Todo Progress</h3>
      <ListGenerator items={todoProgress} />
      {/* Render the button to update progress */}
      {/* Pass the handleUpdateProgress function as the onClick event handler */}
      <button onClick={handleUpdateProgress}>Update Progress</button>
      {/* Render the button to update task */}
      <button onClick={handleTodoClick}>Update Todo</button>
    </div>
  );
};

export default TodoProgress;
