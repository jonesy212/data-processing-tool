// Import necessary dependencies
import axiosInstance from '@/app/api/axiosInstance';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from './RootSlice';

// Define the entity interface
interface Entity {
    id: string;
    name: string;
    // Add other properties as needed
}

// Define the initial state for the entity slice
interface EntityState<T, Id extends string> {
    entities: T[];
    selectedEntityId: Id | null;
}

// Define CustomEntityState interface
interface CustomEntityState<T, Id extends string> extends EntityState<T, Id> {
    selectedEntityId: Id | null;
}

// Define the initial state for the entity slice
const initialState: CustomEntityState<any, string> = {
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
            state.entities = state.entities.filter(entity => entity.id !== action.payload);
        },

        selectEntity: (state, action: PayloadAction<string>) => {
            state.selectedEntityId = action.payload;
        },

        removeAllEntities: (state) => {
            state.entities = [];
        },
    },
});

// Define async thunks for fetching entities and clearing all entities
export const fetchEntities = createAsyncThunk(
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

// Define selector function to access the entity state
export const selectEntities = (state: RootState) => state.entityManager.entities;

// Export the reducer and actions
export const { addEntity, removeEntity, selectEntity, removeAllEntities } = useEntityManagerSlice.actions;

// Export the reducer
export const entityManagerReducer = useEntityManagerSlice.reducer;
