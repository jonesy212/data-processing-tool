import axios from 'axios';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import CommonDetails, { CommonData } from '../models/CommonData';
import { Data } from '../models/data/Data';
import { Phase } from '../phases/Phase';
import { Snapshot } from '../state/stores/SnapshotStore';
import useTodoManagerStore from '../state/stores/TodoStore';
import { Todo } from './Todo';

const TodoList: React.FC = observer(() => {
  const todoStore = useTodoManagerStore();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get("/api/todos");
        const todos = response.data as Todo[];

        const mappedTodos = todos.map((todoData: Todo) => ({
          id: todoData.id,
          title: todoData.title,
          done: todoData.done,
        }));

        todoStore.addTodos(mappedTodos, {}); // Remove the unnecessary cast
      } catch (error) {
        console.error("Error fetching todos:", error);
        // Handle the error as needed
      }
    };

    fetchTodos();
  }, [todoStore]);

  const handleUpdateTitle = (id: string, newTitle: string) => {
    todoStore.updateTodoTitle({ id: id, newTitle: newTitle });
  };
  const handleToggle = (id: string) => {
    todoStore.toggleTodo(id as keyof typeof todoStore.todos);
  };

  const handleCompleteAll = () => {
    setTimeout(() => {
      todoStore.completeAllTodos();
    }, 1000);
  };

  const handleAdd = () => {
    const newTodoId = "todo_" + Math.random().toString(36).substr(2, 9);
    const newTodo: Todo = {
      id: newTodoId,
      title: "A new todo",
      done: false,
      status: 'pending',
      todos: [],
      description: '',
      dueDate: null,
      priority: 'low',
      assignedTo: null,
      assignee: null,
      assignedUsers: [],
      collaborators: [],
      labels: [],
      comments: [],
      attachments: [],
      subtasks: [],
      isArchived: false,
      isCompleted: false,
      isBeingEdited: false,
      isBeingDeleted: false,
      isBeingCompleted: false,
      isBeingReassigned: false,
      save: function (): Promise<void> {
        throw new Error('Function not implemented.');
      },
      _id: '',
      isActive: false,
      tags: [],
      then: (callback: (newData: Snapshot<Data>) => void) => callback,

      analysisType: '',
      analysisResults: [],
      phase: {} as Phase,
      videoData: {} as VideoData
    }; // Remove the unnecessary cast

    todoStore.addTodo(newTodo);
    handleUpdateTitle(newTodoId, "A new todo");
  };

  return (
    <div>
      <ul>
        {todoStore.todos.map((todo: Todo & CommonData<Data>) => (
          <li key={todo.id}>
            {todo.title} - {todo.done ? "Done" : "Not Done"}
            <button onClick={() => handleToggle(todo.id as string)}>Toggle</button>
            <CommonDetails data={todo} />
          </li>
        ))}
      </ul>

      <button onClick={handleAdd}>Add Todo</button>
      <button onClick={handleCompleteAll}>Complete All</button>
    </div>
  );
});

export default TodoList;




















