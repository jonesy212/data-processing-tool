// BookMarkActions.ts
import { createAction } from "@reduxjs/toolkit";
import { BookmarkStatus } from "../models/data/StatusType";
import BookmarkData from "../models/data/BookmarkData";


export const BookmarkActions = {
  // Single Bookmark Actions
  addBookmark: createAction<BookmarkData>("addBookmark"),
  addBookmarkSuccess: createAction<{ id: number; title: string }>(
    "addBookmarkSuccess"
  ),
  addBookmarkFailure: createAction<string>("addBookmarkFailure"),

  // Update Bookmark Actions
  updateBookmark: createAction<Partial<BookmarkData>>("updateBookmark"),
  updateBookmarkDetails: createAction<Partial<BookmarkData>>(
    "updateBookmarkDetails"
  ),
  updateBookmarkDetailsSuccess: createAction<Partial<BookmarkData>>(
    "updateBookmarkDetailsSuccess"
  ),
  updateBookmarkDetailsFailure: createAction<string>(
    "updateBookmarkDetailsFailure"
  ),
  updateBookmarkDetailsReset: createAction("updateBookmarkDetailsReset"),

  // Fetch Bookmarks Actions
  fetchBookmarksRequest: createAction<{ id: number; status: BookmarkStatus }>(
    "fetchBookmarksRequest"
  ),
  fetchBookmarksSuccess: createAction<{ bookmarks: BookmarkData[] }>(
    "fetchBookmarksSuccess"
  ),
  fetchBookmarksFailure: createAction<{ error: string }>(
    "fetchBookmarksFailure"
    ),
  
  
  deleteBookmark: createAction<number>("deleteBookmark"),

  selectBookmark: createAction<number>("selectBookmark"),
  selectBookmarkSuccess: createAction<{ id: number }>("selectBookmarkSuccess"),

  updateBookmarkTitle: createAction<{ id: number; title: string }>(
    "updateBookmarkTitle"
  ),
  updateBookmarkTitleSuccess: createAction<{ id: number; title: string }>(
    "updateBookmarkTitleSuccess"
  ),
  updateBookmarkTitleFailure: createAction<{ error: string }>(
    "updateBookmarkTitleFailure"
  ),
  updateBookmarkStatus: createAction<{ id: number; status: BookmarkStatus }>(
    "updateBookmarkStatus"
    ),
  
  // Update Bookmark Status Actions
  updateBookmarkStatusSuccess: createAction<{
    id: number;
    status: BookmarkStatus;
  }>("updateBookmarkStatusSuccess"),
  updateBookmarkStatusFailure: createAction<{
    id: number;
    status: BookmarkStatus;
  }>("updateBookmarkStatusFailure"),

  // Collaborate Actions
  communication: createAction<{ id: number; status: BookmarkStatus }>(
    "communication"
  ),
  communicationSuccess: createAction<{ id: number; status: BookmarkStatus }>(
    "communicationSuccess"
  ),
  communicationFailure: createAction<{ id: number; status: BookmarkStatus }>(
    "communicationFailure"
  ),

  collaboration: createAction<{
    id: number;
    userId: number;
    status: BookmarkStatus;
  }>("collaboration"),
  collaborationSuccess: createAction<{
    id: number;
    userId: number;
    status: BookmarkStatus;
  }>("collaborationSuccess"),
  collaborationFailure: createAction<{
    id: number;
    userId: number;
    status: BookmarkStatus;
  }>("collaborationFailure"),


  projectManagement: createAction<{ id: number; status: BookmarkStatus }>(
    "projectManagement"
  ),
  projectManagementSuccess: createAction<{
    id: number;
    status: BookmarkStatus;
  }>("projectManagementSuccess"),
  projectManagementFailure: createAction<{
    id: number;
    status: BookmarkStatus;
  }>("projectManagementFailure"),

  dataAnalysis: createAction<{ id: number; status: BookmarkStatus }>(
    "dataAnalysis"
  ),
  dataAnalysisSuccess: createAction<{ id: number; status: BookmarkStatus }>(
    "dataAnalysisSuccess"
  ),
  dataAnalysisFailure: createAction<{ id: number; status: BookmarkStatus }>(
    "dataAnalysisFailure"
  ),

  exportBookmark: createAction<{ id: number; status: BookmarkStatus }>(
    "exportBookmark"
  ),
  exportBookmarkSuccess: createAction<{ id: number; status: BookmarkStatus }>(
    "exportBookmarkSuccess"
  ),
  exportBookmarkFailure: createAction<{ id: number; status: BookmarkStatus }>(
    "exportBookmarkFailure"
  ),

  bookmarkText: createAction<{selectedText: { id: number; text: string} }>("bookmarkText"),
  highlightText: createAction<{ selectedText: {id: number; text: string} }>("highlightText"),
  // Communication Actions
  initiateAudioCall: createAction("initiateAudioCall"),
  initiateVideoCall: createAction("initiateVideoCall"),
  sendTextMessage: createAction("sendTextMessage"),

  // Task Organization Actions
  addTaskToPhase: createAction("addTaskToPhase"),
  updateTaskDetails: createAction("updateTaskDetails"),
  deleteTask: createAction("deleteTask"),

  // Crypto Section Actions
  manageCryptoPortfolio: createAction("manageCryptoPortfolio"),
  executeCryptoTrade: createAction("executeCryptoTrade"),
  stayInformed: createAction("stayInformed"),
  engageWithCommunity: createAction("engageWithCommunity"),

  // Bulk Bookmark Actions
  addBookmarks: createAction<BookmarkData[]>("addBookmarks"),
  updateBookmarks: createAction<Partial<BookmarkData>[]>("updateBookmarks"),
  deleteBookmarks: createAction<number[]>("deleteBookmarks"),

};
