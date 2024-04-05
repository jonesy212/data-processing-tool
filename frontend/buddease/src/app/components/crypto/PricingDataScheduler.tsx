// PricingDataScheduler.tsx
import { fetchPricingData } from "@/app/api/ApiCrypto";
import React, { useEffect } from "react";

const PricingDataScheduler: React.FC = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pricing data using our API wrapper
        const pricingData = await fetchPricingData();
        console.log("Pricing data:", pricingData);
        
        // Process the fetched pricing data as needed
        // Example: Real-time price comparison logic
        // analyzePriceData(pricingData);

      } catch (error) {
        console.error("Error fetching pricing data:", error);
        // Handle errors using the error handling mechanism in the API wrapper
        // handleApiError(error);
      }
    };

    // Fetch pricing data initially when component mounts
    fetchData();

    // Set up interval to fetch pricing data periodically (e.g., every hour)
    const intervalId = setInterval(fetchData, 3600000); // Fetch data every hour (3600000 milliseconds)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return null; // This component doesn't render anything to the DOM
};

export default PricingDataScheduler;
