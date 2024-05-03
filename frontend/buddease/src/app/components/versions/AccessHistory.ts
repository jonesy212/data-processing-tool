// AccessHistory.ts
class AccessHistory {
  // Properties
  userId: number;
  timestamp: Date;
  action: string;

  // Constructor
  constructor(userId: number, timestamp: Date, action: string) {
    this.userId = userId;
    this.timestamp = timestamp;
    this.action = action;
  }

  // Methods
  // You can add methods here if needed
}

// Example usage:
const accessRecord1 = new AccessHistory(1234, new Date(), "Login");
const accessRecord2 = new AccessHistory(5678, new Date(), "Logout");

console.log(accessRecord1);
console.log(accessRecord2);
