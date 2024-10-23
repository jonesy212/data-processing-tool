// SliceGenerator.tsx
import { Draft, PayloadAction, createSlice, isDraft } from "@reduxjs/toolkit";
import { Draft as ImmerDraft } from "immer";

interface EntityState<T> {
  entities: { [id: string]: T };
}

export const createEntitySlice = <T extends { id: string }>(
  entityName: string
) => {
  const initialState: EntityState<T> = {
    entities: {},
  };

  const entitySlice = createSlice({
    name: entityName,
    initialState,
    reducers: {
      addEntity: (state, action: PayloadAction<Draft<T>>) => {
        if (isDraft(state)) {
          const draft = state as ImmerDraft<EntityState<T>>;
          draft.entities[action.payload.id] = action.payload;
        }
      },
      updateEntity: (state, action: PayloadAction<Draft<T>>) => {
        if (isDraft(state)) {
          const draft = state as ImmerDraft<EntityState<T>>;
          draft.entities[action.payload.id] = action.payload;
        }
      },
      removeEntity: (state, action: PayloadAction<string>) => {
        delete state.entities[action.payload];
      },
      //todo add update, dupicate entities
      // Add other actions as needed
    },
  });

  return entitySlice;
};

