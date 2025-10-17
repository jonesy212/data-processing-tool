// TaskComment.tsx
interface TaskComment {
    id: string; // Unique identifier for the comment
    taskId: string; // Identifier of the task to which the comment belongs
    userId: string; // Identifier of the user who posted the comment
    content: string; // Content of the comment
    timestamp: number; // Timestamp indicating when the comment was posted
  }
  