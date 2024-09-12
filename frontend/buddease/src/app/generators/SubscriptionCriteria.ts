// SubscriptionCriteria.ts
interface SubscriptionCriteria {
  eventType: string; // e.g., "security breach", "system alert"
  severity?: string; // e.g., "high", "medium", "low"
  // Other criteria fields as needed
}

interface StatusUpdate {
  eventId: string;
  status: 'resolved' | 'closed' | 'in-progress'; // Example statuses
  comments?: string; // Optional comments about the status update
}


export type { SubscriptionCriteria, StatusUpdate };