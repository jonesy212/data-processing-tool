import React from 'react';

interface LoadingIndicatorProps {
  loading: boolean; // Show loading indicator
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ loading }) => {
  return (
    <div style={{ display: loading ? 'block' : 'none', textAlign: 'center', marginTop: '20px' }}>
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;
