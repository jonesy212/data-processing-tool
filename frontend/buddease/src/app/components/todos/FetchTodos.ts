import { Todo } from "./Todo";
import { TodoActions } from "./TodoActions";


// Fetch todos function (replace this with your actual asynchronous fetch logic)
const fetchTodos = async (): Promise<Todo[]> => {
    // Simulating an API call
    const response = await fetch("https://api.example.com/todos");
    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }
    return response.json();
};
  

export const handleFetchTodos = async (
  dispatch: React.Dispatch<TodoActions>
) => {
  // Dispatch the fetch todos request action
  dispatch({ type: TodoActions.fetchTodosRequest });

  try {
    // Fetch todos asynchronously
    const todos = await fetchTodos();

    // Dispatch the fetch todos success action with the fetched todos
    dispatch({
      type: TodoActions.fetchTodosSuccess,
      payload: { todos },
    });
  } catch (error: any) {
    // Dispatch the fetch todos failure action with the error message
    dispatch({
      type: TodoActions.fetchTodosFailure,
      payload: {
        id: 'fetchTodosFailure',
        title: 'Fetch Todos Failure',
        error: error.message,
        done: false,
      },
    });
  }
};
