import { PaginationOptions } from '@/app/pages/searchs/SearchOptions';
import { FilterCriteria } from '@/app/pages/searchs/FilterCriteria';
import { createSlice, EntityState, PayloadAction, createEntityAdapter } from '@reduxjs/toolkit';
import { Todo } from '../../../todos/Todo';
import { WritableDraft } from '../ReducerGenerator';

export interface TodoManagerState extends EntityState<WritableDraft<Todo>, string>  {
  todos: Todo[]; // List of todos
  ids: string[];
  selectedTodo: Todo | null; // Currently selected todo
  loading: boolean; // Indicates whether the app is fetching or processing data
  error: string | null; // Error message, if any
  filterCriteria: FilterCriteria | null; // Enhanced filter criteria
  sortBy?: keyof Todo | null; // Sorting property
  sortDirection?: "asc" | "desc" | null; // Sorting direction
  searchQuery?: string | null; // Search query for filtering todos
  pagination?: PaginationOptions; 
}


// Adapter for managing EntityState
const todoAdapter = createEntityAdapter<Todo>();

// Initial state using the adapter and the new structure
const todoInitialState: TodoManagerState = {
  ...todoAdapter.getInitialState(), // Inherits EntityState properties
  todos: [], // Initialize with an empty list of todos
  selectedTodo: null, // No selected todo initially
  loading: false, // Loading state
  error: null, // Error state
  filterCriteria: null, // Optional filter criteria
  sortBy: null, // No initial sorting property
  sortDirection: null, // No initial sorting direction
  searchQuery: null, // No initial search query
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
};

export const useTodoManagerSlice = createSlice({
  name: "todoManager",
  initialState: todoInitialState,
  reducers: {
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.entities[action.payload];
      if (todo) {
        todo.done = !todo.done;
      }
    },
    addTodo: (state, action: PayloadAction<Todo>) => {
      todoAdapter.addOne(state, action.payload);
    },
    removeTodo: (state, action: PayloadAction<string>) => {
      todoAdapter.removeOne(state, action.payload);
    },
    updateTodoTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string }>
    ) => {
      const todo = state.entities[action.payload.id];
      if (todo) {
        todo.title = action.payload.newTitle;
      }
    },
    fetchTodosSuccess: (
      state,
      action: PayloadAction<{ todos: Todo[] }>
    ) => {
      todoAdapter.setAll(state, action.payload.todos);
    },
    fetchTodosFailure: (state, action: PayloadAction<{ error: string }>) => {
      state.error = action.payload.error;
      state.loading = false;
    },
    completeAllTodosRequest: (state) => {
      Object.values(state.entities).forEach((todo) => {
        if (todo) {
          todo.done = true;
        }
      });
    },
    completeAllTodosSuccess: (state) => {
      Object.values(state.entities).forEach((todo) => {
        if (todo) {
          todo.done = true;
        }
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
  completeAllTodosSuccess
} = useTodoManagerSlice.actions;
export const selectTodos = (state: { todos: EntityState<Todo, string> }) =>
  state.todos.entities;

export default useTodoManagerSlice.reducer;

