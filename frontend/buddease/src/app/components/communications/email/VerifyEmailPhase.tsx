// VerifyEmailPhase.tsx
import { useState } from 'react';
import React from "react";

// Define enum for email verification phases
enum VerifyEmailPhaseEnum {
  VERIFY_EMAIL = 'Verify Email',
}

const VerifyEmailPhase = ({ onComplete }: { onComplete: () => void }) => {
  const [currentPhase, setCurrentPhase] = useState<VerifyEmailPhaseEnum>(VerifyEmailPhaseEnum.VERIFY_EMAIL);

  return (
    <div>
      <h3>Verify Email Phase - {currentPhase}</h3>
      {currentPhase === VerifyEmailPhaseEnum.VERIFY_EMAIL && (
        <VerifyEmailPhase onComplete={onComplete} />
      )}
    </div>
  );
};

export default VerifyEmailPhase;
