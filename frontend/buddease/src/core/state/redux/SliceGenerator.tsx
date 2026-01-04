SliceGenerator.tsx
import { PayloadAction, createSlice, Draft } from "@reduxjs/toolkit";

interface GenericEntityState<T extends { id: string }> {
  entities: T[];
  selectedEntityId: string | null;
}

export const createEntitySlice = <T extends { id: string }>(
  entityName: string
) => {
  const initialState: GenericEntityState<T> = {
    entities: [],
    selectedEntityId: null,
  };

  const entitySlice = createSlice({
    name: entityName,
    initialState,
    reducers: {
      // Solution: Accept Draft<T> or use type assertion
      addEntity: (state, action: PayloadAction<Draft<T>>) => {
        const entity = action.payload;
        state.entities.push(entity);
      },
      
    updateEntity: (state, action: PayloadAction<Partial<T> & { id: string }>) => {
      const { id, ...rest } = action.payload;
      const changes: Partial<T> = rest;
      
      const index = state.entities.findIndex(entity => entity.id === id);
      if (index !== -1) {
        Object.assign(state.entities[index], changes);
      }
    },
      
      removeEntity: (state, action: PayloadAction<string>) => {
        const id = action.payload;
        state.entities = state.entities.filter(entity => entity.id !== id);
        if (state.selectedEntityId === id) {
          state.selectedEntityId = null;
        }
      },
      
      selectEntity: (state, action: PayloadAction<string>) => {
        state.selectedEntityId = action.payload;
      },
      
      setEntities: (state, action: PayloadAction<Draft<T>[]>) => {
        state.entities = action.payload;
      },
      
      clearAllEntities: (state) => {
        state.entities = [];
        state.selectedEntityId = null;
      },
    },
  });

  return entitySlice;
};