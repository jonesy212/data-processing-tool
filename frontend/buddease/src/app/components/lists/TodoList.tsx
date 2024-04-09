// TodoList.tsx
import { observer } from "mobx-react-lite";
import React from "react";
import { Link } from "react-router-dom";
import  TodoList  from '@/app/components/todos/TodoList';

interface TodoListProps {
  todoists?: TodoList[];
  onRemoveTodoList?: (todoist: TodoList) => void;
  onCompleteTodoList?: (todoist: TodoList) => void;
  onUpdateTodoListTitle?: (todoistId: string, updatedTitle: string) => void;
  onUpdateTodoListDescription?: (todoist: TodoList) => void;
  onUpdateTodoListStatus?: (todoist: TodoList) => void;
}

const TodoListList: React.FC<TodoListProps> = observer(({ todoists = [] }) => {
  // Explicitly type todoists as an array of TodoList

  return (
    <div>
      <h2>TodoList List</h2>
      <ul>
        {todoists.map((todoist: TodoList) => (
          <li key={todoist.id}>
            <Link to={`/todoist-details/${todoist.id}`}>
              {/* Render TodoListDetails component for each todoist if needed */}
              {todoist.title} - {todoist.status}
            </Link>
            {todoist.details && <TodoDetails todoist={todoist} />}{" "}
            {/* Only render TodoListDetails if details exist */}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default TodoListList;
