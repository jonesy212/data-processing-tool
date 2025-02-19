// DetailsListActions.ts
import { Data } from '@/app/components/models/data/Data';
import { createAction } from '@reduxjs/toolkit';
import { DetailsItem } from '../../stores/DetailsListStore';

const PREFIX = 'detailsList';

export const DetailsListActions = {

  // Action to create a new details item
  createDetailsItemRequest: createAction<{ newDetailsItemData: any }>(`${PREFIX}/createDetailsItemRequest`),
  createDetailsItemSuccess: createAction<{ detailsItem: DetailsItem<Data> }>(`${PREFIX}/createDetailsItemSuccess`),
  createDetailsItemFailure: createAction<{ error: string }>(`${PREFIX}/createDetailsItemFailure`),

  // Action to update details item
  updateDetailsItemRequest: createAction<{ detailsItemId: string, updatedDetailsItemData: any }>(`${PREFIX}/updateDetailsItemRequest`),
  updateDetailsItemSuccess: createAction<{ detailsItemId: string, detailsItem: DetailsItem<Data> }>(`${PREFIX}/updateDetailsItemSuccess`),
  updateDetailsItemFailure: createAction<{ error: string }>(`${PREFIX}/updateDetailsItemFailure`),

  // Action to delete details item  
  deleteDetailsItemRequest: createAction<{ detailsItemId: string }>(`${PREFIX}/deleteDetailsItemRequest`),
  deleteDetailsItemSuccess: createAction<{ detailsItemId: string }>(`${PREFIX}/deleteDetailsItemSuccess`),
  deleteDetailsItemFailure: createAction<{ error: string }>(`${PREFIX}/deleteDetailsItemFailure`),

  // Action to clear details items (reset to initial state)
  clearDetailsItems: createAction(`${PREFIX}/clearDetailsItems`),

  // Action to fetch a single details item
  fetchDetailsItemRequest: createAction<string>(`${PREFIX}/fetchDetailsItemRequest`),
  fetchDetailsItemSuccess: createAction<{ detailsItem: DetailsItem<Data> }>(`${PREFIX}/fetchDetailsItemSuccess`),
  fetchDetailsItemFailure: createAction<{ error: string }>(`${PREFIX}/fetchDetailsItemFailure`),

  // Action to fetch all details items
  fetchDetailsItemsRequest: createAction(`${PREFIX}/fetchDetailsItemsRequest`),
  fetchDetailsItemsSuccess: createAction<{ detailsItems: DetailsItem<Data>[] }>(`${PREFIX}/fetchDetailsItemsSuccess`),
  fetchDetailsItemsFailure: createAction<{ error: string }>(`${PREFIX}/fetchDetailsItemsFailure`),

  // Action to update multiple details items
  updateDetailsItemsRequest: createAction<{ updatedDetailsItemsData: any }>(`${PREFIX}/updateDetailsItemsRequest`),
  updateDetailsItemsSuccess: createAction<{ detailsItems: DetailsItem<Data>[] }>(`${PREFIX}/updateDetailsItemsSuccess`),
  updateDetailsItemsFailure: createAction<{ error: string }>(`${PREFIX}/updateDetailsItemsFailure`),

  // Action to delete multiple details items
  deleteDetailsItemsRequest: createAction<string[]>(`${PREFIX}/deleteDetailsItemsRequest`),
  deleteDetailsItemsSuccess: createAction<string[]>(`${PREFIX}/deleteDetailsItemsSuccess`),
  deleteDetailsItemsFailure: createAction<{ error: string }>(`${PREFIX}/deleteDetailsItemsFailure`),

  
};

export type DetailsListActionsType = typeof DetailsListActions;
