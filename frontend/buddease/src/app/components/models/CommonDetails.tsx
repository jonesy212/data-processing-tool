
// CommonDetails.tsx
import React, { useState } from "react";
import { CommonData, SupportedData } from "./CommonData";



interface Customizations<T> {
  [key: string]: (value: any) => React.ReactNode;
}

// Define the CommonDetailsProps interface with the generic CommonData type
interface CommonDetailsProps<T> {
  data?: CommonData
  customizations?: Customizations<T>;
}

// CommonDetails component for displaying common details
const CommonDetails = <T extends SupportedData>({
  data,
  customizations,
}: CommonDetailsProps<T>) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <div>
      <button onClick={toggleDetails}>Toggle Details</button>
      {showDetails && data && (
        <div>
          <h3>Common Details</h3>
          {/* Handle different data types here */}
          {Object.entries(data).map(([key, value]) => {
            // Check if a customization function exists for this key
            const renderFunction = customizations && customizations[key];
            if (renderFunction) {
              return renderFunction(value);
            } else {
              // Default rendering if no customization function is provided
              return (
                <p key={key}>
                  {key}: {value as React.ReactNode}
                </p>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

export default CommonDetails;
export type { CommonData, Customizations };
