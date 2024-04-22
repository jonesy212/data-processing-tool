import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilterState {
  // Define properties specific to filter state
  filters: {
    // Define filter properties here
    startDate: Date;
    endDate: Date;
    // Add more filter properties as needed
  };
  status: string | null; // Example: "pending", "inProgress", "completed"
  priority: string | null; // Example: "low", "medium", "high"
  assignedUser: string | null; // Example: User ID

  // Define any other properties related to filtering
}

const initialState: FilterState = {
  filters: {
    // Initialize with default filter values
    startDate: new Date(),
    endDate: new Date(),
    // Initialize other filter properties as needed
  },
  status: null,
  priority: null,
  assignedUser: null,

  // Initialize other state properties as needed
};

const useFilterManagerSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    // Define reducers for updating filter properties
    updateStartDate: (state, action: PayloadAction<Date>) => {
      state.filters.startDate = action.payload;
    },
    updateEndDate: (state, action: PayloadAction<Date>) => {
      state.filters.endDate = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.status = action.payload;
    },
    setPriorityFilter: (state, action: PayloadAction<string | null>) => {
      state.priority = action.payload;
    },
    setAssignedUserFilter: (state, action: PayloadAction<string | null>) => {
      state.assignedUser = action.payload;
    },

    // Add more reducers for other filter properties as needed
    // For example:
    // updateFilterProperty: (state, action: PayloadAction<PropertyType>) => {
    //   state.filters.property = action.payload;
    // },
  },
});

export const {
  updateStartDate,
  updateEndDate,
  setStatusFilter,
  setPriorityFilter,
  setAssignedUserFilter,
} = useFilterManagerSlice.actions;

export const filterReducer = useFilterManagerSlice.reducer;
