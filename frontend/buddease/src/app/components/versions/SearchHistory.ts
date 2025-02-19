class SearchHistory {
  // Properties
  query: string;
  timestamp: Date;
  userId: number;

  // Constructor
  constructor(query: string, timestamp: Date, userId: number) {
    this.query = query;
    this.timestamp = timestamp;
    this.userId = userId;
  }

  // Methods
  // You can add methods here if needed
}

// Example usage:
const searchRecord1 = new SearchHistory("Search query 1", new Date(), 1234);
const searchRecord2 = new SearchHistory("Search query 2", new Date(), 5678);

console.log(searchRecord1);
console.log(searchRecord2);
export default SearchHistory