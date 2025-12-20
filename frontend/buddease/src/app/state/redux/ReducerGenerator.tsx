// ReducerGenerator.tsx
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { CollaboratorEntity } from '@/app/typings/entities/CollaboratorEntity';
import { PayloadAction } from "@reduxjs/toolkit";
import { Draft, isDraft } from "immer";

export type WritableDraft<EntityData> = Draft<EntityData>;

// UPDATED: EntityState to match your RootState structure
interface EntityState<
  T extends BaseDataEntity = BaseDataRoot
> {
  entities: { [id: string]: T }; // Use T instead of EntityData to match your generic structure
}

export interface EntityAction<
  T extends BaseDataEntity = BaseDataRoot
> extends PayloadAction<Draft<T>> {
  id: string;
}

// Updated type guard
function isEntityAction<
  T extends BaseDataEntity = BaseDataRoot
>(
  action: EntityAction<T> | PayloadAction<string>
): action is EntityAction<T> {
  return (action as EntityAction<T>).id !== undefined;
}

interface EntityReducerOptions<
  T extends BaseDataEntity = BaseDataRoot
> {
  type: string;
  updateFunction: (entity: T, payload: any) => void;
}

// UPDATED: createEntityReducer with proper generics
export const createEntityReducer = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  options: EntityReducerOptions<T>
) => (
  state: WritableDraft<EntityState<T>>,
  action: EntityAction<T> | PayloadAction<string>
) => {
  if (isDraft(state)) {
    const draft = state as WritableDraft<EntityState<T>>;

    if (isEntityAction(action)) {
      const entity = draft.entities[action.id];
      if (entity) {
        options.updateFunction(entity as T, action.payload);
      }
    }
  }
};

// Example usage with proper typing:
export const setCollaboratorsReducer = createEntityReducer({
  type: "setCollaborators",
  updateFunction: (entity: { collaborators: CollaboratorEntity[] }, payload) => {
    entity.collaborators = payload.collaborators;
  },
});

export const setDueDateReducer = createEntityReducer({
  type: "setDueDate",
  updateFunction: (entity: { dueDate: string }, payload) => {
    entity.dueDate = payload.dueDate;
  },
});