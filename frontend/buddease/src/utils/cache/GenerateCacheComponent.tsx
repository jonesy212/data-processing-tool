GenerateCacheComponent.ts
components/cache/GenerateCacheComponent.tsx
"use client";

import React from 'react';

interface GenerateCacheComponentProps {
  // Add any props needed for cache generation
  onCacheGenerated?: () => void;
}

const GenerateCacheComponent: React.FC<GenerateCacheComponentProps> = ({
  onCacheGenerated
}) => {
  const handleGenerateCache = async () => {
    try {
      // You can call an API endpoint that uses GenerateCache.ts logic
      const response = await fetch('/api/generate-cache', {
        method: 'POST'
      });
      
      if (response.ok) {
        console.log('Cache generated successfully');
        onCacheGenerated?.();
      }
    } catch (error) {
      console.error('Failed to generate cache:', error);
    }
  };

  return (
    <div className="generate-cache-component">
      <h3>Generate Cache</h3>
      <button 
        onClick={handleGenerateCache}
        className="btn btn-primary"
      >
        Generate Cache
      </button>
      <p className="description">
        This will regenerate the application cache and refresh all cached data.
      </p>
    </div>
  );
};

export default GenerateCacheComponent;