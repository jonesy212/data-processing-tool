// TwoFactorSetupPhase component
import React from "react";
import { useState } from "react";
import axiosInstance from "../security/csrfToken";

// TwoFactorSetupPhase component
const TwoFactorSetupPhase: React.FC<{ onSetupComplete: () => void }> = ({
  onSetupComplete,
}) => {
  // State for the token input
  const [token, setToken] = useState('');

  // Handler for submitting the two-factor authentication token
  const handleSubmit = async () => {
    try {
      // Make an API call to verify the two-factor authentication token
      const response = await axiosInstance.post('/auth/verify-2fa', { token });
      // Handle response and call the onSetupComplete callback if successful
      if (response.status === 200) {
        onSetupComplete();
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      // Handle error
      console.error('Error verifying two-factor authentication token:', error);
    }
  };

  return (
    <div>
      {/* Your component code here */}
      <input
        type="text"
        placeholder="Enter token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default TwoFactorSetupPhase;
