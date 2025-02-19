//ReducerGenerator.tsx
import { PayloadAction } from "@reduxjs/toolkit";
import { Draft, isDraft } from "immer";

export type WritableDraft<EntityData> = Draft<EntityData>;

interface EntityState<EntityData> {
  entities: { [id: string]: EntityData };
}

export interface EntityAction<EntityData>
  extends PayloadAction<Draft<EntityData>> {
  // You can include additional properties if needed
  id: string;
}
//type-guard
function isEntityAction<EntityData>(
  action: EntityAction<EntityData> | PayloadAction<string>
): action is EntityAction<EntityData> {
  return (action as EntityAction<EntityData>).id !== undefined;
}
interface EntityReducerOptions<EntityData> {
  type: string;
  updateFunction: (entity: EntityData, payload: any) => void;
}


export const createEntityReducer = <EntityData extends Draft<any>>(
  options: EntityReducerOptions<EntityData>
) => (
  state: WritableDraft<EntityState<EntityData>>,
  action: EntityAction<EntityData> | PayloadAction<string>
) => {
  if (isDraft(state)) {
    const draft = state as WritableDraft<EntityState<EntityData>>;

    if (isEntityAction(action)) {
      const entity = draft.entities[action.id];
      if (entity) {
        options.updateFunction(entity as EntityData, action.payload);
      }
    }
  }
};

// Example usage:


export const setCollaboratorsReducer = createEntityReducer({
  type: "setCollaborators",
  updateFunction: (entity: { collaborators: Collaborator[] }, payload) => {
    entity.collaborators = payload.collaborators;
  },
});

export const setDueDateReducer = createEntityReducer({
  type: "setDueDate",
  updateFunction: (entity: { dueDate: string }, payload) => {
    entity.dueDate = payload.dueDate;
  },
});
// Add more generic reducers as needed
