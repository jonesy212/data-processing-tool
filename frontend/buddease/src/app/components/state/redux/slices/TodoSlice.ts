import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { Todo, todoInitialState } from '../../../todos/Todo';
import { WritableDraft } from '../ReducerGenerator';

export interface TrackerManagerState extends EntityState<WritableDraft<Todo>, string>  {
  todos: WritableDraft<Todo>[];
  ids: string[];
}

export const useTodoManagerSlice = createSlice({
  name: "todoManager",
  initialState: todoInitialState as unknown as TrackerManagerState,
  reducers: {
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.entities[action.payload] as WritableDraft<Todo>;
      if (todo) {
        todo.done = !todo.done;
      }
    },
    addTodo: (state, action: PayloadAction<WritableDraft<Todo>>) => {
      state.entities[action.payload.id] = action.payload;
    },

    removeTodo: (state, action: PayloadAction<string>) => {
      delete state.entities[action.payload];
    },
    updateTodoTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string }>
    ) => {
      const todo = state.entities[action.payload.id] as WritableDraft<Todo>;
      if (todo) {
        todo.title = action.payload.newTitle;
      }
    },
    fetchTodosSuccess: (
      state,
      action: PayloadAction<{ todos: WritableDraft<Todo>[] }>
    ) => {
      const { todos } = action.payload;
      todos.forEach((todo: WritableDraft<Todo>) => {
        state.entities[todo.id] = todo;
      });
    },

    fetchTodosFailure: (state, action: PayloadAction<{ error: string }>) => {
      // Handle fetch todos failure if needed
    },
    completeAllTodosRequest: (state) => {
      // Handle complete all todos request if needed
      // update UI state to indicate that all todos are being completed
      Object.values(state.entities).forEach((todo: WritableDraft<Todo>) => {
        todo.done = true;
      });
    },
    completeAllTodosSuccess: (state) => {
      // Mark all todos as done
      Object.values(state.entities).forEach((todo: WritableDraft<Todo>) => {
        todo.done = true;
      });
    },
  },
});

export const {
  toggleTodo,
  addTodo,
  removeTodo,
  updateTodoTitle,
  fetchTodosSuccess,
  fetchTodosFailure,
  completeAllTodosRequest,
  completeAllTodosSuccess } = useTodoManagerSlice.actions;
export const selectTodos = (state: { todos: EntityState<Todo, string> }) =>
  state.todos.entities;

export default useTodoManagerSlice.reducer;

