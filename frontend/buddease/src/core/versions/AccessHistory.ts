// AccessHistory.ts
import type { AccessRecord } from "@/core/documents/DocumentOptions";

class AccessHistory {
  // Properties
  userId: string;
  timestamp: Date;
  action: string;

  // Constructor
  constructor(userId: string, timestamp: Date, action: string) {
    this.userId = userId;
    this.timestamp = timestamp;
    this.action = action;
  }

  // Methods
  // You can add methods here if needed
}

export default AccessHistory


// Converter function
function convertAccessRecordToHistory(record: AccessRecord): AccessHistory {
  return new AccessHistory((record.userId), new Date(record.timestamp), record.action);
}

function convertAccessHistoryToRecord(history: AccessHistory): AccessRecord {
  return {
    userId: history.userId.toString(),
    timestamp: history.timestamp.toISOString(),
    action: history.action,
  };
}


export { convertAccessHistoryToRecord, convertAccessRecordToHistory };

// Example usage:
const accessRecord1 = new AccessHistory('1234', new Date(), "Login");
const accessRecord2 = new AccessHistory('5678', new Date(), "Logout");

console.log(accessRecord1);
console.log(accessRecord2);
