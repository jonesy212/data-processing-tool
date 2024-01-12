
// GenerateNewTodo.ts
import { Todo } from "../components/todos/Todo";
let currentTodoId = 1;

export const generateNewTodo = (projectId: string): Todo => {
  // Make the todo ID more unique and identifiable between teams and projects
  const todoId = `${projectId}_${currentTodoId}`;
  
  // Increment the todo ID for the next todo
  currentTodoId++;

  return {
    id: todoId,
    title: "",
    description: "",
    status: "todo",
    // Add other properties as needed
  } as Todo;  
};  

