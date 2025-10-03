import useDynamicNavigation from "@/app/hooks/useDynamicNavigation";
import useTodoManagerStore from "@/app/state/stores/TodoStore";

// Use useDynamicNavigation hook to conditionally navigate based on todo list length
const TodoComponent = () => {
    useDynamicNavigation(() => useTodoManagerStore().todoList.length === 0, '/no-todos');
  
    return (
      // Your Todo component JSX
    );
  };
  
  export default TodoComponent;