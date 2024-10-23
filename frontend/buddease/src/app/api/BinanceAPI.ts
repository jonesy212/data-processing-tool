// BinanceAPI.ts

// Import necessary modules
import axios, { AxiosInstance } from 'axios';

// Define BinanceAPI class
class BinanceAPI {
  private apiUrl: string;
  private httpClient: AxiosInstance;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
    // Create an Axios instance for making HTTP requests
    this.httpClient = axios.create({
      baseURL: this.apiUrl,
    });
  }

  // Method to fetch data from the Binance API
  async fetchData(endpoint: string): Promise<any> {
    try {
      const response = await this.httpClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching data from Binance API:', error);
      throw error;
    }
  }

  // Add more methods as needed to interact with different endpoints of the Binance API
}

// Export the BinanceAPI class
export default BinanceAPI;
