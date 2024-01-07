import axios from 'axios';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import CommonDetails from '../models/CommonDetailsProps';
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

        todoStore.addTodos(mappedTodos as Todo[], {});
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
    todoStore.toggleTodo(id);
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
    };

    todoStore.addTodo(newTodo);
    handleUpdateTitle(newTodoId, "A new todo");
  };

  return (
    <div>
      <ul>
        {todoStore.todos.map((todo: Todo) => (
          <li key={todo.id}>
            {todo.title} - {todo.done ? "Done" : "Not Done"}
            <button onClick={() => handleToggle(todo.id)}>Toggle</button>
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
