import { useEffect, useState } from "react";

// Expanded AquaConfig with additional options
export interface AquaConfig {
  apiUrl: string;
  maxConnections: number;
  timeout: number; // Added timeout option in milliseconds
  secureConnection: boolean; // Added secure connection option
  reconnectAttempts: number; // Added number of reconnect attempts
  autoReconnect: boolean; // Added auto-reconnect option
  // Add more configuration options as needed
}

// Example usage with expanded configuration options:
const aquaConfig: AquaConfig = {
  apiUrl: 'https://example.com/aqua-api',
  maxConnections: 10,
  timeout: 5000, // Set a default timeout of 5000 milliseconds
  secureConnection: true, // Use a secure connection by default
  reconnectAttempts: 3, // Set a default of 3 reconnect attempts
  autoReconnect: true, // Enable auto-reconnect by default
  // Additional configuration options...
};

// Function component example using AquaConfig
const AquaConfigExample: React.FC = () => {
  const [aquaConfigState, setAquaConfigState] = useState<AquaConfig | null>(null);

  useEffect(() => {
    // Simulate fetching AquaConfig from an external source (e.g., API)
    const fetchAquaConfig = async () => {
      try {
        // Simulate fetching AquaConfig from an API endpoint
        const response = await fetch('https://example.com/api/aqua-config');
        const fetchedAquaConfig: AquaConfig = await response.json();
        setAquaConfigState(fetchedAquaConfig);
      } catch (error) {
        console.error('Error fetching AquaConfig:', error);
      }
    };

    // Fetch AquaConfig when the component mounts
    fetchAquaConfig();
  }, []);

  return (
    <div>
      <h2>AquaConfig Example</h2>
      {aquaConfigState && (
        <div>
          <p>API URL: {aquaConfigState.apiUrl}</p>
          <p>Max Connections: {aquaConfigState.maxConnections}</p>
          {/* Display other AquaConfig options as needed */}
        </div>
      )}
    </div>
  );
};

export default AquaConfigExample;
