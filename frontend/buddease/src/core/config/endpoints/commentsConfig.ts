// commentsConfig.ts
import { CommentsEndpoints } from '@/core/typings/categories/CommentsEndpoints';

export const commentsConfig: CommentsEndpoints = {
  list: { path: "/api/comments/list", method: "GET" },
  single: (commentId: number) => ({ path: `/note/${commentId}`, method: "GET" }),
};