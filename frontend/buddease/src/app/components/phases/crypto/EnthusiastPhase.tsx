// EnthusiastPhase.tsx
import { useState } from 'react';
import RiskAssessment from './RiskAssessment';
import TraderTypesSelection from './TraderTypesSelection';
import VerificationProcess from './VerificationProcess';
import EnthusiastProfile from './EnthusiastProfile';

// Define an enum for trading phases
enum TradingPhase {
  VERIFICATION = 'Verification',
  RISK_ASSESSMENT = 'Risk Assessment',
  TRADER_TYPE_SELECTION = 'Trader Type Selection',
  ENTHUSIAST_PROFILE = 'Enthusiast Profile',
  // Add additional phases as needed
}

const EnthusiastPhase = () => {
  // State variables for current phase and search query
  const [currentPhase, setCurrentPhase] = useState<TradingPhase>(TradingPhase.VERIFICATION);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Additional logic to handle search content based on currentPhase
  };

  // Function to handle completion of each phase and transition to the next phase
  const handlePhaseCompletion = () => {
    // Logic to determine the next phase based on the current phase
    // For example:
    switch (currentPhase) {
      case TradingPhase.VERIFICATION:
        return TradingPhase.RISK_ASSESSMENT;
      case TradingPhase.RISK_ASSESSMENT:
        return TradingPhase.TRADER_TYPE_SELECTION;
      case TradingPhase.TRADER_TYPE_SELECTION:
        return TradingPhase.ENTHUSIAST_PROFILE;
      // Add cases for transitioning to other phases
      default:
        return currentPhase;
    }
  };

  // Render sub-phases based on the current phase
  const renderSubPhases = () => {
    switch (currentPhase) {
      case TradingPhase.VERIFICATION:
        return <VerificationProcess onComplete={handlePhaseCompletion} />;
      case TradingPhase.RISK_ASSESSMENT:
        return <RiskAssessment onComplete={handlePhaseCompletion} />;
      case TradingPhase.TRADER_TYPE_SELECTION:
        return <TraderTypesSelection onSelect={handlePhaseCompletion} />;
      case TradingPhase.ENTHUSIAST_PROFILE:
        return <EnthusiastProfile onComplete={handlePhaseCompletion} />;
      // Add cases for rendering other sub-phases or components
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Enthusiast Phase</h2>
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

export default EnthusiastPhase;
