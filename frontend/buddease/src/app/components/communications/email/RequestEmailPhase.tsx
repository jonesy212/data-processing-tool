
// RequestEmailPhase.tsx
import React from "react";

import { useState } from 'react';

// Define the enum for email confirmation phases
enum RequestEmailPhaseEnum {
  ENTER_EMAIL = 'Enter Email',
  SUBMIT_EMAIL = 'Submit Email',
  // Add additional phases as needed
}

const RequestEmailPhase = ({ onComplete }: { onComplete: () => void }) => {
  const [currentPhase, setCurrentPhase] = useState<RequestEmailPhaseEnum>(RequestEmailPhaseEnum.ENTER_EMAIL);
  const [email, setEmail] = useState('');

  const handleEmailSubmit = () => {
    // Logic to submit email
    // For example: validation, API call, etc.
    onComplete(); // Transition to the next phase
  };

  return (
    <div>
      <h3>Request Email Phase - {currentPhase}</h3>
      {currentPhase === RequestEmailPhaseEnum.ENTER_EMAIL && (
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={() => setCurrentPhase(RequestEmailPhaseEnum.SUBMIT_EMAIL)}>Next</button>
        </div>
      )}
      {currentPhase === RequestEmailPhaseEnum.SUBMIT_EMAIL && (
        <div>
          <p>Submitted email: {email}</p>
          <button onClick={handleEmailSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default RequestEmailPhase;
