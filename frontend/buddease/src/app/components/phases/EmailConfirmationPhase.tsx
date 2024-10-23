// EmailConfirmationPhase.tsx
import React, { useState } from "react";
import RequestEmailPhase from '../communications/email/RequestEmailPhase';
import VerifyEmailPhase from '../communications/email/VerifyEmailPhase';

enum EmailConfirmationPhaseEnum {
  REQUEST_EMAIL = 'Request Email',
  VERIFY_EMAIL = 'Verify Email',
  // Add additional phases as needed
}

const EmailConfirmationPhase = () => {
  const [currentPhase, setCurrentPhase] = useState<EmailConfirmationPhaseEnum>(EmailConfirmationPhaseEnum.REQUEST_EMAIL);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Additional logic for handling search content based on the current phase
  };

  const handlePhaseCompletion = () => {
    switch (currentPhase) {
      case EmailConfirmationPhaseEnum.REQUEST_EMAIL:
        return EmailConfirmationPhaseEnum.VERIFY_EMAIL;
      // Add cases for transitioning to other phases
      default:
        return currentPhase;
    }
  };

  const renderSubPhases = () => {
    switch (currentPhase) {
      case EmailConfirmationPhaseEnum.REQUEST_EMAIL:
        return <RequestEmailPhase onComplete={handlePhaseCompletion} />;
      case EmailConfirmationPhaseEnum.VERIFY_EMAIL:
        return <VerifyEmailPhase onComplete={handlePhaseCompletion} />;
      // Add cases for rendering other sub-phases or components
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Email Confirmation Phase</h2>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {renderSubPhases()}
    </div>
  );
};

export default EmailConfirmationPhase;
