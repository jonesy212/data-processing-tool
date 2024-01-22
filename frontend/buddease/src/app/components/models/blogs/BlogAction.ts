
// blogActions.ts
import { createAction } from "@reduxjs/toolkit";
import { BlogComment, BlogPost } from "./types"; // Replace with actual types

export const BlogActions = {
  // Fetch Posts
  fetchPostsRequest: createAction("blog/fetchPostsRequest"),
  fetchPostsSuccess: createAction<{ posts: BlogPost[] }>("blog/fetchPostsSuccess"),
  fetchPostsFailure: createAction<{ error: string }>("blog/fetchPostsFailure"),

  // Fetch Comments
  fetchCommentsRequest: createAction<{ postId: string }>("blog/fetchCommentsRequest"),
  fetchCommentsSuccess: createAction<{ postId: string; comments: BlogComment[] }>("blog/fetchCommentsSuccess"),
  fetchCommentsFailure: createAction<{ postId: string; error: string }>("blog/fetchCommentsFailure"),

  // Add Post
  addPostRequest: createAction<BlogPost>("blog/addPostRequest"),
  addPostSuccess: createAction<BlogPost>("blog/addPostSuccess"),
  addPostFailure: createAction<{ error: string }>("blog/addPostFailure"),

  // Add Comment
  addCommentRequest: createAction<BlogComment>("blog/addCommentRequest"),
  addCommentSuccess: createAction<BlogComment>("blog/addCommentSuccess"),
  addCommentFailure: createAction<{ error: string }>("blog/addCommentFailure"),

  // Batch Actions
  batchAddPostsRequest: createAction<{ posts: BlogPost[] }>("blog/batchAddPostsRequest"),
  batchAddPostsSuccess: createAction<{ addedPosts: BlogPost[] }>("blog/batchAddPostsSuccess"),
  batchAddPostsFailure: createAction<{ error: string }>("blog/batchAddPostsFailure"),

  batchAddCommentsRequest: createAction<{ comments: BlogComment[] }>("blog/batchAddCommentsRequest"),
  batchAddCommentsSuccess: createAction<{ addedComments: BlogComment[] }>("blog/batchAddCommentsSuccess"),
  batchAddCommentsFailure: createAction<{ error: string }>("blog/batchAddCommentsFailure"),

  // Add more actions as needed
};
