// TaskForm.tsx
import DynamicTextArea from '@/app/ts/DynamicTextArea';
import React, { useState } from 'react';
import { Task } from './Task';


interface TaskFormProps {
  onSubmit: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const handleSubmit = () => {
    if (taskName.trim() === "") {
      alert("Task name cannot be empty");
      return;
    }

    const newTask = {
      id: Date.now(),
      name: taskName,
      description: taskDescription,
      status: "pending",
    } as unknown as Task;

    onSubmit(newTask);

    // Clear form fields
    setTaskName("");
    setTaskDescription("");
  };

  return (
    <div>
      <h2>Add New Task</h2>
      <label>
        Task Name:
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Task Description:
        <DynamicTextArea
          value={taskDescription}
          onChange={(newText) => setTaskDescription(newText)}

        />
      </label>
      <br />
      <button onClick={handleSubmit}>Add Task</button>
    </div>
  );
};

export default TaskForm;
