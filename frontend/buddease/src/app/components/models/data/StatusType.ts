
// Define the type for the status property
type NotificationStatusType = "sent" | "delivered" | "read" | "error" | "pending" | "tentative" | "inProgress" | "confirmed" | "cancelled" | "scheduled" | "completed";




// StatusType.ts
enum StatusType {
    Pending = "pending",
    Tentative = "tentative",
    InProgress = "inProgress",
    Confirmed = "confirmed",
    Cancelled = "cancelled",
    Scheduled = "scheduled",
    Completed = "completed",
  }
  
  // Define specific enums for different types of status
  enum TaskStatus {
    Pending = StatusType.Pending,
    InProgress = StatusType.InProgress,
    Completed = StatusType.Completed,
  }

  enum TodoStatus {
    Pending = StatusType.Pending,
    InProgress = StatusType.InProgress,
    Completed = StatusType.Completed,
  }

  enum TeamStatus {
    Pending = StatusType.Pending,
    InProgress = StatusType.InProgress,
    Completed = StatusType.Completed,
  }

  enum DataStatus {
    Pending = StatusType.Pending,
    InProgress = StatusType.InProgress,
    Completed = StatusType.Completed,
  }
  
  enum TeamStatus {
    Active = "active",
    Inactive = "inactive",
  }
enum ComponentStatus {
  Tentative = StatusType.Tentative,
  }
  

// Define the CalendarStatus enum
enum CalendarStatus {
    LOADING = "loading",
    READY = "ready",
  ERROR = "error",
    
  Pending = StatusType.Pending,
  InProgress = StatusType.InProgress,
  Completed = StatusType.Completed,
  Scheduled = StatusType.Scheduled,
  Tentative = StatusType.Tentative,
    // Add more status options as needed
}

enum NotificationStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  ERROR = "error",
  // Add more status options as needed
  PENDING = "pending",
  TENTATIVE = "tentative",
  IN_PROGRESS = "inProgress",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
}
  

 
enum PriorityStatus {
  Low= "low",
  Medium= "medium",
  High = "high",
  Normal = "normal"
} 
 
export enum PriorityTypeEnum {
  Low= PriorityStatus.Low,
  Medium= PriorityStatus.Medium,
  High = PriorityStatus.High,
  Normal = PriorityStatus.Normal
}

export { CalendarStatus, ComponentStatus, DataStatus, NotificationStatus, PriorityStatus, StatusType, TaskStatus, TeamStatus, TodoStatus };

