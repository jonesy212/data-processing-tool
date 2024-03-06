// ApiSlice.ts
import { ApiConfig } from "@/app/configs/ConfigurationService";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface ApiManagerState {
  apiConfigs: ApiConfig[];
  apiConfigName: string;
  apiConfigUrl: string;
  apiConfigTimeout: number;
  todos: string[],
  tasks: string[]
  
}

const initialState: ApiManagerState = {
  apiConfigs: [],
  apiConfigName: "",
  apiConfigUrl: "",
  apiConfigTimeout: 0,
  todos: [],
  tasks: [],
};

export const useApiManagerSlice = createSlice({
  name: "apiManager",
  initialState,
  reducers: {
    updateApiConfigName: (state, action: PayloadAction<string>) => {
      state.apiConfigName = action.payload;
    },

    updateApiConfigUrl: (state, action: PayloadAction<string>) => {
      state.apiConfigUrl = action.payload;
    },

    updateApiConfigTimeout: (state, action: PayloadAction<number>) => {
      state.apiConfigTimeout = action.payload;
    },

    addApiConfig: (state, action: PayloadAction<ApiConfig>) => {
      state.apiConfigs.push(action.payload);
      state.apiConfigName = "";
      state.apiConfigUrl = "";
      state.apiConfigTimeout = 0;
    },

    removeApiConfig: (state, action: PayloadAction<number>) => {
      state.apiConfigs = state.apiConfigs.filter(
        (config) => config.id !== action.payload
      );
    },

    markTaskComplete:  (state, action: PayloadAction<string>) => { 
      const {id} = await dispatch(addTask(action.payload));
      const taskIndex = state.tasks.findIndex((task) => task.id === action.payload);
      if (taskIndex >= 0) {
        state.tasks[taskIndex].isComplete = true;
      }
    }

  },
});

// Export actions
export const {
  updateApiConfigName,
  updateApiConfigUrl,
  updateApiConfigTimeout,
  addApiConfig,
  removeApiConfig,
} = useApiManagerSlice.actions;



// Extend the method to mark tasks as complete
export const markTaskAsComplete = (taskId: string, task: string) => async (dispatch: any) => {
  markTaskAsComplete(taskId, "task");
};

// Extend the method to mark todos as complete
export const markTodoAsComplete = (todoId: string, todo: string) => async (dispatch: any) => {
  markTaskAsComplete(todoId, "todo");
};


// Export selector for accessing the API configurations from the state
export const selectApiConfigs = (state: { apiManager: ApiManagerState }) =>
  state.apiManager.apiConfigs;

// Export reducer for the API manager slice
export default useApiManagerSlice.reducer;

export type { ApiManagerState };














