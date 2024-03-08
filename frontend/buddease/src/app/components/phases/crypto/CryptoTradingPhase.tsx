import React, { useState } from 'react';
import VerificationProcess from './VerificationProcess';
import RiskAssessment from './RiskAssessment';
import TraderTypesSelection from './TraderTypesSelection';

const CryptoTradingPhase = () => {
  // State variables for sub-phases
  const [verificationDone, setVerificationDone] = useState(false);
  const [riskAssessmentDone, setRiskAssessmentDone] = useState(false);
  const [selectedTraderType, setSelectedTraderType] = useState('');

  // Function to handle completion of verification process
  const handleVerificationCompletion = () => {
    setVerificationDone(true);
  };

  // Function to handle completion of risk assessment
  const handleRiskAssessmentCompletion = () => {
    setRiskAssessmentDone(true);
  };

  // Function to handle selection of trader type
  const handleTraderTypeSelection = (type: string) => {
    setSelectedTraderType(type);
  };

  // Render sub-phases based on completion status
  const renderSubPhases = () => {
    if (!verificationDone) {
      return (
        <VerificationProcess onComplete={handleVerificationCompletion} />
      );
    } else if (!riskAssessmentDone) {
      return (
        <RiskAssessment onComplete={handleRiskAssessmentCompletion} />
      );
    } else if (!selectedTraderType) {
      return (
        <TraderTypesSelection onSelect={handleTraderTypeSelection} />
      );
    } else {
      // Render other sub-phases or components as needed
      return (
        <div>
          {/* Render additional sub-phases/components */}
        </div>
      );
    }
  };

  return (
    <div>
      <h2>Crypto Trading Phase</h2>
      {renderSubPhases()}
    </div>
  );
};

export default CryptoTradingPhase;
