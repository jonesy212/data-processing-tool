// PricingDataScheduler.tsx
import axios from "axios";
import { useEffect } from "react";

const PricingDataScheduler: React.FC = () => {
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        //todo verify accurate apis to use for
        // Define the list of API endpoints for fetching pricing data
        const cryptoApiEndpoints = [
          "https://api.binance.com/api/v3/ticker/price",
          "https://api.pro.coinbase.com/products",
          "https://api.kraken.com/0/public/Ticker",
        ];

        // Iterate over each API endpoint and fetch pricing data
        for (const endpoint of cryptoApiEndpoints) {
          const response = await axios.get(endpoint);
          console.log(`${endpoint} pricing data:`, response.data);
          // Process the fetched pricing data as needed
        }
      } catch (error) {
        console.error("Error fetching pricing data:", error);
      }
    };

    // Fetch pricing data initially when component mounts
    fetchPricingData();

    // Set up interval to fetch pricing data periodically (e.g., every hour)
    const intervalId = setInterval(fetchPricingData, 3600000); // Fetch data every hour (3600000 milliseconds)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return null; // This component doesn't render anything to the DOM
};

export default PricingDataScheduler;
