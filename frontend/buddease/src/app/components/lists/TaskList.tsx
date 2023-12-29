import { observer } from 'mobx-react-lite';
import React from 'react';
import { Task, TaskDetails } from '../models/tasks/Task';

interface TaskListProps{
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = observer(({tasks}) => {
  // Explicitly type tasks as an array of Task

  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((task: Task) => (
          <li key={task.id}>
            {task.title} - {task.status}
            <TaskDetails task={task} />
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TaskList;