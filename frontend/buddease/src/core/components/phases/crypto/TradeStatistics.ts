// TradeStatistics.ts
class TradeStatistics {
    private totalVolume: number;
    private totalPrice: number;
    private totalTrades: number;
  
    constructor() {
      this.totalVolume = 0;
      this.totalPrice = 0;
      this.totalTrades = 0;
    }
  
    // Function to update trade statistics
    updateStatistics(price: number, quantity: number): void {
      // Update total volume
      this.totalVolume += quantity;
  
      // Update total price
      this.totalPrice += price * quantity;
  
      // Increment total trades count
      this.totalTrades++;
  
      // Calculate average price
      const averagePrice = this.totalPrice / this.totalVolume;
  
      // Log the updated statistics
      console.log("Trade statistics updated - Total Volume:", this.totalVolume, "Average Price:", averagePrice);
    }
  }
  
  // Example usage:
  const tradeStats = new TradeStatistics();
  
  // Update trade statistics with sample trade data
  const price = 100.50;
  const quantity = 10;
  tradeStats.updateStatistics(price, quantity);
  