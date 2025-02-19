// SortCriteria.tsx
enum SortCriteria {
  Title = "title",
  Date = "date",
  Priority = "priority",
  Status = "status",
  Duration = "duration",
  Revelance = "relevance",
  Newest = "newest",
  Oldest = "oldest",


  //todos/tasks/projects
  EstimatedHours = "estimatedHours",
  CompletionDate = "completionDate",
  TaskStatus = "taskStatus",
  TodoStatus = "todoStatus",
  ProductStatus = "productStatus",
  CalendarStatus = "calendarStatus",
  NotificationStatus = "notificationStatus",
  PriorityTypeEnum = "priorityTypeEnum",
  TeamStatus = "teamStatus",
  DataStatus = "dataStatus",

  // file
  FileSize = "fileSize",
  FileType = "fileType",
  UploadDate = "uploadDate",
  Owner = "owner",
  AccessLevel = "accessLevel",

  // messages
  Sender = "sender",
  Receiver = "receiver",
  Timestamp = "timestamp",
  Message = "message",
  Tags = "tags",
  WordSearch = "wordSearch",

  // Add more sorting criteria as needed
}
export { SortCriteria };
