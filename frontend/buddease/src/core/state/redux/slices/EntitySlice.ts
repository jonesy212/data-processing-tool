// EntitySlice.ts
// Import necessary dependencies
import axiosInstance from '@/core/api/csrfToken';
import { RootState } from '@/core/state/redux/slices/RootSlice';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';


// Define the entity interface
interface Entity {
    id: string;
    name: string;
    // Add other properties as needed
}

// Simple array-based entity state
interface EntityState {
  entities: Entity[];
  selectedEntityId: string | null;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date;
}

// Define the initial state for the entity slice
const initialState: EntityState = {
    entities: [],
    selectedEntityId: null,
};

// Create the entity slice using createSlice
export const useEntityManagerSlice = createSlice({
    name: 'entityManager',
    initialState,
    reducers: {
        // Define reducer functions to update the state
        addEntity: (state, action: PayloadAction<Entity>) => {
            state.entities.push(action.payload);
        },

        removeEntity: (state, action: PayloadAction<string>) => {
            state.entities = state.entities.filter((entity: Entity) => entity.id !== action.payload);
            // Clear selection if the removed entity was selected
            if (state.selectedEntityId === action.payload) {
                state.selectedEntityId = null;
            }
        },

        selectEntity: (state, action: PayloadAction<string>) => {
            state.selectedEntityId = action.payload;
        },

        removeAllEntities: (state) => {
            state.entities = [];
            state.selectedEntityId = null;
        },

        // Additional reducers
        updateEntity: (state, action: PayloadAction<{id: string; changes: Partial<Entity>}>) => {
            const { id, changes } = action.payload;
            const index = state.entities.findIndex((entity: Entity) => entity.id === id);
            if (index !== -1) {
                state.entities[index] = {
                    ...state.entities[index],
                    ...changes
                };
            }
        },

        setEntities: (state, action: PayloadAction<Entity[]>) => {
            state.entities = action.payload;
        },

        clearSelection: (state) => {
            state.selectedEntityId = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEntities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEntities.fulfilled, (state, action: PayloadAction<Entity[]>) => {
                state.loading = false;
                state.entities = action.payload;
                state.lastUpdated = new Date();
            })
            .addCase(fetchEntities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch entities';
            });
    },
});

// Define async thunks for fetching entities and clearing all entities
export const fetchEntities = createAsyncThunk<Entity[], string>(
    'entityManager/fetchEntities',
    async (entityName: string) => {
        try {
            const response = await axiosInstance.get(`/api/${entityName}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${entityName}:`, error);
            throw error;
        }
    }
);

export const clearAllEntities = createAsyncThunk(
    'entityManager/clearAllEntities',
    async (_, { dispatch }) => {
        dispatch(removeAllEntities());
    }
);

// Export types
export type { EntityState };

// Define selector functions to access the entity state
export const selectEntities = (state: RootState) => state.entityManager.entities;
export const selectSelectedEntityId = (state: RootState) => state.entityManager.selectedEntityId;
export const selectSelectedEntity = (state: RootState) => 
    state.entityManager.selectedEntityId 
        ? state.entityManager.entities.find((entity: Entity) => entity.id === state.entityManager.selectedEntityId)
        : null;
export const selectEntityById = (id: string) => (state: RootState) => 
    state.entityManager.entities.find((entity: Entity) => entity.id === id);
export const selectEntityLoading = (state: RootState) => state.entityManager.loading;
export const selectEntityError = (state: RootState) => state.entityManager.error;

// Export the reducer and actions
export const { 
    addEntity, 
    removeEntity, 
    selectEntity, 
    removeAllEntities,
    updateEntity,
    setEntities,
    clearSelection
} = useEntityManagerSlice.actions;

// Export the reducer
export const entityManagerReducer = useEntityManagerSlice.reducer;