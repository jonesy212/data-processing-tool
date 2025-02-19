import { createAction } from "@reduxjs/toolkit";

export const SearchActions = {
  // Actions for initiating search
  initiateSearch: createAction<string | null>("initiateSearch"),
  initiateSearchRequest: createAction<string>("initiateSearchRequest"),
  initiateSearchSuccess: createAction<any>("initiateSearchSuccess"),
  initiateSearchFailure: createAction<{ error: string }>("initiateSearchFailure"),

  setSearchQuery: createAction<string>("setSearchQuery"),
  // Actions for filtering search results
  filterSearchResults: createAction<string>("filterSearchResults"),
  filterSearchResultsRequest: createAction<string>("filterSearchResultsRequest"),
  filterSearchResultsSuccess: createAction<any>("filterSearchResultsSuccess"),
  filterSearchResultsFailure: createAction<{ error: string }>("filterSearchResultsFailure"),

  // Actions for displaying search results
  displaySearchResults: createAction<any>("displaySearchResults"),
  displaySearchResultsRequest: createAction<any>("displaySearchResultsRequest"),
  displaySearchResultsSuccess: createAction<any>("displaySearchResultsSuccess"),
  displaySearchResultsFailure: createAction<{ error: string }>("displaySearchResultsFailure"),

  // Additional actions
  updateSearchQuery: createAction<string>("updateSearchQuery"),
  clearSearchResults: createAction("clearSearchResults"),

  // Add more actions as needed
};
