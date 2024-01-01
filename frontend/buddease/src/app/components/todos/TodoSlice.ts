import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { Todo } from './Todo';

const todoEntitySlice = createSlice({
  name: 'todos',
  initialState: { entities: {} } as EntityState<Todo, string>,
  reducers: {
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.entities[action.payload];
      if (todo) {
        todo.done = !todo.done;
      }
    },
    addTodo: (state, action: PayloadAction<Todo>) => {
      state.entities[action.payload.id] = action.payload;
    },

    removeTodo: (state, action: PayloadAction<string>) => {
      delete state.entities[action.payload];
    },
    updateTodoTitle: (state, action: PayloadAction<{ id: string; newTitle: string }>) => {
      const todo = state.entities[action.payload.id];
      if (todo) {
        todo.title = action.payload.newTitle;
      }
    },
    fetchTodosSuccess: (state, action: PayloadAction<{ todos: Todo[] }>) => {
      const { todos } = action.payload;
      todos.forEach((todo) => {
        state.entities[todo.id] = todo;
      });
    },
    
    fetchTodosFailure: (state, action: PayloadAction<{ error: string }>) => {
      // Handle fetch todos failure if needed
      
    },
    completeAllTodosRequest: (state) => {
      // Handle complete all todos request if needed
      // update UI state to indicate that all todos are being completed
      Object.values(state.entities).forEach((todo) => {
        todo.done = true;
      });
    },
    completeAllTodosSuccess: (state) => {
      // Mark all todos as done
      Object.values(state.entities).forEach((todo) => {
        todo.done = true;
      });
    },
  },
});

export const { toggleTodo, addTodo, removeTodo, updateTodoTitle, fetchTodosSuccess, fetchTodosFailure, completeAllTodosRequest, completeAllTodosSuccess } = todoEntitySlice.actions;
export const selectTodos = (state: { todos: EntityState<Todo, string> }) =>
  state.todos.entities;

export default todoEntitySlice.reducer;

