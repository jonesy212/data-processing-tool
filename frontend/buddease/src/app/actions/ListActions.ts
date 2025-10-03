import { createAction } from '@reduxjs/toolkit';
import { ListState } from '@/app/state/stores/ListItem';
import { SortingType } from "@/app/models/data/StatusType";

export const ListActions = {
    updateListState: createAction<ListState>("updateListState"),
    updateSorting: createAction<SortingType>("updateSorting"),
  // Add more actions here if needed
};