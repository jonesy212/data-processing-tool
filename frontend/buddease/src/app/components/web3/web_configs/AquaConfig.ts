
export interface AquaConfig  {
    // Define configuration settings for Aqua here
    apiUrl: string;
    maxConnections: number;
    // Add more configuration options as needed
  }
  
  // Example usage:
  const aquaConfig: AquaConfig = {
    apiUrl: 'https://example.com/aqua-api',
    maxConnections: 10,
    // Additional configuration options...
  };
  