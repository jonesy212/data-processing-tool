// ListActions.ts
import type { SortingType } from "@/core/models/data/StatusType";
import type { ListState } from '@/core/state/stores/ListItem';
import { createAction } from '@reduxjs/toolkit';

export const ListActions = {
    updateListState: createAction<ListState>("updateListState"),
    updateSorting: createAction<SortingType>("updateSorting"),
  // Add more actions here if needed
};