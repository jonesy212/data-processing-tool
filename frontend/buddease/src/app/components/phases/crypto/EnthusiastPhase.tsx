// EnthusiastPhase.tsx
import React, { useState } from "react";
import AddContent from '../../models/content/AddContent'; // Import AddContent component
import CallsConferences from './CallsConferences';
import DoYourOwnResearch from './DoYourOwnResearch';
import EnthusiastProfile from './EnthusiastProfile';
import FollowTraders from './FollowTraders';
import RiskAssessment from './RiskAssessment';
import TraderTypesSelection from './TraderTypesSelection';
import VerificationProcess from './VerificationProcess';

// Define an enum for trading phases
enum TradingPhase {
  VERIFICATION = 'Verification',
  RISK_ASSESSMENT = 'Risk Assessment',
  TRADER_TYPE_SELECTION = 'Trader Type Selection',
  ENTHUSIAST_PROFILE = 'Enthusiast Profile',
  FOLLOW_TRADERS = 'Follow Traders', // Add Follow Traders phase
  DO_YOUR_OWN_RESEARCH = 'Do Your Own Research', // Add Do Your Own Research phase
  PARTICIPATE_CALLS_CONFERENCES = 'Participate in Calls/Conferences', // Add Participate in Calls/Conferences phase
  ADD_CONTENT = 'Add Content', // Add Add Content phase
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
      case TradingPhase.ENTHUSIAST_PROFILE:
        return TradingPhase.FOLLOW_TRADERS; // Transition to Follow Traders phase
      case TradingPhase.FOLLOW_TRADERS:
        return TradingPhase.DO_YOUR_OWN_RESEARCH; // Transition to Do Your Own Research phase
      case TradingPhase.DO_YOUR_OWN_RESEARCH:
        return TradingPhase.PARTICIPATE_CALLS_CONFERENCES; // Transition to Participate in Calls/Conferences phase
      case TradingPhase.PARTICIPATE_CALLS_CONFERENCES:
        return TradingPhase.ADD_CONTENT; // Transition to Add Content phase
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
      case TradingPhase.FOLLOW_TRADERS:
        return <FollowTraders onComplete={handlePhaseCompletion} />; // Render Follow Traders component
      case TradingPhase.DO_YOUR_OWN_RESEARCH:
        return <DoYourOwnResearch onComplete={handlePhaseCompletion} />; // Render Do Your Own Research component
      case TradingPhase.PARTICIPATE_CALLS_CONFERENCES:
        return <CallsConferences onComplete={handlePhaseCompletion} />; // Render Participate in Calls/Conferences component
      case TradingPhase.ADD_CONTENT:
        return <AddContent onComplete={handlePhaseCompletion} />; // Render Add Content component
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
