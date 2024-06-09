import React, { useEffect, useState } from "react";

// Expanded SharingConfig with additional options
export interface SharingConfig {
  shareApiUrl: string;
  maxShares: number;
  shareTimeout: number; // Added share timeout option in milliseconds
  secureShareConnection: boolean; // Added secure share connection option
  retryShareAttempts: number; // Added number of retry share attempts
  autoRetryShare: boolean; // Added auto-retry share option
  // Add more configuration options as needed
}

// Example usage with expanded configuration options:
const sharingConfig: SharingConfig = {
  shareApiUrl: 'https://example.com/share-api',
  maxShares: 5,
  shareTimeout: 10000, // Set a default share timeout of 10000 milliseconds
  secureShareConnection: true, // Use a secure share connection by default
  retryShareAttempts: 5, // Set a default of 5 retry share attempts
  autoRetryShare: true, // Enable auto-retry share by default
  // Additional configuration options...
};

const SharingConfigExample: React.FC = () => {
    const [sharingConfigState, setSharingConfigState] = useState<SharingConfig | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchSharingConfig = async () => {
        try {
          const response = await fetch('https://example.com/api/sharing-config');
          const fetchedSharingConfig: SharingConfig = await response.json();
          setSharingConfigState(fetchedSharingConfig);
        } catch (error) {
          setError('Error fetching SharingConfig. Please try again.');
        } finally {
          setLoading(false);
        }
      };
  
      fetchSharingConfig();
    }, []);
  
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error: {error}</p>;
    }
  
    return (
      <div>
        <h2>SharingConfig Example</h2>
        {sharingConfigState && (
          <div>
            <p>Share API URL: {sharingConfigState.shareApiUrl}</p>
            <p>Max Shares: {sharingConfigState.maxShares}</p>
            {/* Display other SharingConfig options as needed */}
          </div>
        )}
      </div>
    );
  };
  
//   todo: add to centralized logging service 