// LoadingSpinner.tsx
import React from "react";

interface LoadingSpinnerProps {
  loading: boolean; // Show loading spinner
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loading }) => (
  <div>
    {/* Display loading spinner if loading is true */}
    {loading && <LoadingSpinner loading={false} />}

    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;
