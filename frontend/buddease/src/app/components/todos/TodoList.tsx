// todo/TodoList.tsx
import { produce } from "immer";
import { useCallback, useReducer } from "react";
import { TodoActions } from "./TodoActions";
import { TodoReducer } from "./TodoReducer";

const TodoList = () => {
  const [todos, dispatch] = useReducer(produce(TodoReducer), [
    /* initial todos */
  ]);

  const handleToggle = useCallback((id: string) => {
    dispatch({
      type: TodoActions.toggle,
      payload: id,
    });
  }, []);

  const handleAdd = useCallback(() => {
    dispatch({
      type: TodoActions.add,
      payload: "todo_" + Math.random(),
    });
  }, []);

  // etc

  return (
    <div>
      {/* Your TodoList component JSX here */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.title} - {todo.done ? "Done" : "Not Done"}
            <button onClick={() => handleToggle(todo.id)}>Toggle</button>
          </li>
        ))}
      </ul>
      <button onClick={handleAdd}>Add Todo</button>
    </div>
  );
};







export default TodoList;



