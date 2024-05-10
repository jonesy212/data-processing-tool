import { createAction } from '@reduxjs/toolkit';
import { ListState } from '../state/stores/ListItem';
import { SortingType } from '../models/data/StatusType';

export const ListActions = {
    updateListState: createAction<ListState>("updateListState"),
    updateSorting: createAction<SortingType>("updateSorting"),
  // Add more actions here if needed
};