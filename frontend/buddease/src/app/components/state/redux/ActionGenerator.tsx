//ActionGenerator.tsx
import { PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";
import { TodoActions } from "../../todos/TodoActions";

interface EntityAction<EntityData> extends PayloadAction<Draft<EntityData>> {
  id: string;
}

interface EntityActions<EntityData> {
  addEntity: (entity: Draft<EntityData>) => EntityAction<EntityData>;
  updateEntity: (
    id: string,
    entity: Draft<EntityData>
  ) => EntityAction<EntityData>;
  removeEntity: (id: string) => PayloadAction<string>;
  // Add other actions as needed
}

interface ShareEntityAction<EntityData> extends PayloadAction<string> {
  entityData: EntityData;
}

const createEntityActions = <EntityData extends { id: string }>() => {
  return {
    addEntity: (entity: Draft<EntityData>): EntityAction<EntityData> => ({
      payload: entity,
      type: "addEntity",
      id: entity.id,
    }),

    updateEntity: (
      id: string,
      entity: Draft<EntityData>
    ): EntityAction<EntityData> => ({
      payload: entity,
      type: "updateEntity",
      id,
    }),
    removeEntity: (id: string): PayloadAction<string> => ({
      payload: id,
      type: "removeEntity",
    }),
    shareEntity: (entity: EntityData): ShareEntityAction<EntityData> => ({
      payload: entity.id,
      type: "shareEntity",
      entityData: entity,
    }),
    // Include Todo actions
    toggleTodo: (id: string) => TodoActions.toggle(id),
    addTodo: (id: string) => TodoActions.addTodo(id),
    // Add other actions as needed
  } as EntityActions<EntityData>;
};

// Example usage:

type EntityData = {
  id: string;
  // Other properties
};

const entityActions = createEntityActions<EntityData>();
