// CommonDetails.tsx
import { useState } from "react";
import { Data } from "./data/Data";

interface DetailsProps {
  data: Data;
}

const CommonDetails: React.FC<DetailsProps> = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <div>
      <button onClick={toggleDetails}>Toggle Details</button>
      {showDetails && (
        <div>
          <h3>Details</h3>
          {Object.entries(data).map(([key, value]) => (
            <p key={key}>
              {key}: {value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommonDetails;
