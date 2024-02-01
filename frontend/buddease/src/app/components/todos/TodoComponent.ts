import useDynamicNavigation from "../hooks/useDynamicNavigation";
import useTodoManagerStore from "../state/stores/TodoStore";

// Use useDynamicNavigation hook to conditionally navigate based on todo list length
const TodoComponent = () => {
    useDynamicNavigation(() => useTodoManagerStore().todoList.length === 0, '/no-todos');
  
    return (
      // Your Todo component JSX
    );
  };
  
  export default TodoComponent;