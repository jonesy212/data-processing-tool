import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { Todo, todoInitialState } from '../../../todos/Todo';
import { WritableDraft } from '../ReducerGenerator';

export interface TodoManagerState extends EntityState<WritableDraft<Todo>, string>  {
  todos: WritableDraft<Todo>[];
  ids: string[];
  loading: boolean;
  error: string | null;
}


// const initialState: TodoManagerState = todoInitialState;
export const useTodoManagerSlice = createSlice({
  name: "todoManager",
  initialState: todoInitialState,
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
      const { error } = action.payload;
      
      // You can update the state to reflect the failure, such as setting an error message
      state.error = error;
    
      // You can also update other parts of the state as needed
      state.loading = false; // Assuming there's a loading state in your slice
      
      // Optionally, you can log the error or perform any additional actions
      
      // For example, if you're using Redux Toolkit's `createAsyncThunk`, you can access the `rejectWithValue` callback
      // and handle the error within the thunk, then dispatch this action with the error payload
      // return rejectWithValue(error);
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

