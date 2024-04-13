import axiosInstance from '@/app/api/axiosInstance';
import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { RootState } from './RootSlice';

interface Entity {
    id: string;
    name: string
    // Add other properties as needed
}

interface EntityState<T> {
    entities: T[];
    selectedEntityId: string | null;
    
}

export const useEntitytManagerSlice = <T>(entityName: string) => {
    const initialState: EntityState<T> = {
        entities: [],
        selectedEntityId: null,
    };

    const entitySlice = createSlice({
        name: entityName,
        initialState,
        reducers: {
            addEntity: (state, action: PayloadAction<Draft<T>>) => {
                state.entities.push(action.payload);
            },

            removeEntity: (state, action: PayloadAction<string>) => {
                state.entities = state.entities.filter(
                    (entity: Draft<T>) => (entity as Entity).id !== action.payload
                );
            },
            

            selectEntity: (state, action: PayloadAction<string>) => {
                state.selectedEntityId = action.payload;
            },

            removeAllEntities: (state) => {
                state.entities = [];
            },
        },
    });

    const entitySliceActions = {
        fetchEntities: () => {
            return async (dispatch: Dispatch) => {
                try {
                    const response = await axiosInstance.get(`/api/${entityName}`);
                    const entities = response.data;
                    dispatch(addEntity(entities));
                } catch (error) {
                    console.error(`Error fetching ${entityName}:`, error);
                }
            };
        },

        clearAllEntities: () => {
            return (dispatch: Dispatch) => {
                dispatch(removeAllEntities());
            };
        },
    };


    const { addEntity, removeEntity, removeAllEntities, selectEntity } = entitySlice.actions;

  const selectEntities = (state: RootState): T[] =>
    state.entityManager[entityName as keyof RootState["entityManager"]] as T[];

    return { ...entitySlice.actions, ...entitySliceActions, selectEntities, reducer: entitySlice.reducer };
};
export default useEntitytManagerSlice;

 
// Export the reducer
export type EntityReducer = ReturnType<typeof useEntitytManagerSlice>['reducer'];
export type { Entity };
