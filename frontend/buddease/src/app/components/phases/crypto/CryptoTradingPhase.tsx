import ProfessionalTraderAlerts from '@/app/pages/personas/ProfessionalTraderAlerts';
import ProfessionalTraderCalendar from '@/app/pages/personas/ProfessionalTraderCalendar';
import ProfessionalTraderCalls from '@/app/pages/personas/ProfessionalTraderCalls';
import ProfessionalTraderCollaboration from '@/app/pages/personas/ProfessionalTraderCollaboration';
import ProfessionalTraderContentManagement from '@/app/pages/personas/ProfessionalTraderContentManagement';
import ProfessionalTraderDashboard from '@/app/pages/personas/ProfessionalTraderDashboard';
import ProfessionalTraderDocuments from '@/app/pages/personas/ProfessionalTraderDocuments';
import ProfessionalTraderProfile from '@/app/pages/personas/ProfessionalTraderProfile';
import React, { useState } from "react";
import { TraderCallsProps } from '../../trading/Trades';
import { tradingPhases } from '../../trading/TradingPhaseConfig';
import RiskAssessment from './RiskAssessment';
import TraderTypesSelection from './TraderTypesSelection';
import VerificationProcess from './VerificationProcess';

enum TradingPhase {
  VERIFICATION = 'Verification',
  RISK_ASSESSMENT = 'Risk Assessment',
  TRADER_TYPE_SELECTION = 'Trader Type Selection',
  PROFESSIONAL_TRADER_PROFILE = 'Professional Trader Profile',
  PROFESSIONAL_TRADER_DASHBOARD = 'Professional Trader Dashboard',
  PROFESSIONAL_TRADER_CALLS = 'Professional Trader Calls',
  PROFESSIONAL_TRADER_CONTENT_MANAGEMENT = 'Professional Trader Content Management',
  
  BASIC_INFO = "BASIC_INFO",
  ASSETS= "ASSETS",
  PREFERENCES= "PREFERENCES",
  REVIEW= "REVIEW",
  SUMMARY= "SUMMARY",
  CONFIRMATION= "CONFIRMATION",
  // Add additional phases as needed
}

const CryptoTradingPhase: React.FC<TraderCallsProps> = ({onSelectPlatform, selectedPlatform}) => {
  const [currentPhase, setCurrentPhase] = useState<TradingPhase>(TradingPhase.VERIFICATION);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Additional logic to handle search content based on currentPhase
    switch (currentPhase) {
      case TradingPhase.VERIFICATION:
        // Handle search content specific to verification phase
        break;
      case TradingPhase.RISK_ASSESSMENT:
        // Handle search content specific to risk assessment phase
        break;
      case TradingPhase.TRADER_TYPE_SELECTION:
        // Handle search content specific to trader type selection phase
        break;
      case TradingPhase.PROFESSIONAL_TRADER_PROFILE:
        // Handle search content specific to professional trader profile phase
        break
      case TradingPhase.PROFESSIONAL_TRADER_DASHBOARD:
      // Handle search content specific to professional trader dashboard phase
        break;
      case TradingPhase.PROFESSIONAL_TRADER_CALLS:
      // Handle search content specific to professional trader calls phase
        break;
      case TradingPhase.PROFESSIONAL_TRADER_CONTENT_MANAGEMENT:
      // Handle search content specific to professional trader content management phase
        break;
      
      // Add cases for other phases as needed
      default:
        break;
    }
  };




  // Function to handle transition to the next phase
  const transitionToNextPhase = () => {
    // Logic to determine the next phase based on the current phase
    // For example:
    switch (currentPhase) {
      case TradingPhase.VERIFICATION:
        return TradingPhase.RISK_ASSESSMENT;
      case TradingPhase.RISK_ASSESSMENT:
        return TradingPhase.TRADER_TYPE_SELECTION;
      case TradingPhase.TRADER_TYPE_SELECTION:
        return TradingPhase.PROFESSIONAL_TRADER_PROFILE;
      // Add cases for transitioning to other phases
      default:
        return currentPhase;
    }
  };

  // Function to handle completion of each phase and transition to the next phase
  const handlePhaseCompletion = () => {
    const nextPhase = transitionToNextPhase();
    setCurrentPhase(nextPhase);
  };

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



  const renderCurrentPhase = () => {
    const currentPhase = tradingPhases[currentPhaseIndex];
    if (currentPhase) {
      const PhaseComponent = currentPhase.component;
      return <PhaseComponent onComplete={handlePhaseCompletion} />;
    }
    // Handle case where current phase is not found
    return null;
  };


  // Render sub-phases based on the current phase and completion status
  const renderSubPhases = () => {
    if (!verificationDone) {
      return <VerificationProcess onComplete={handleVerificationCompletion} />;
    } else if (!riskAssessmentDone) {
      return <RiskAssessment onComplete={handleRiskAssessmentCompletion} />;
    } else if (!selectedTraderType) {
      return <TraderTypesSelection onSelect={handleTraderTypeSelection} />;
    } else {
      switch (currentPhase) {
        case TradingPhase.VERIFICATION:
          return <VerificationProcess onComplete={handlePhaseCompletion} />;
        case TradingPhase.RISK_ASSESSMENT:
          return <RiskAssessment onComplete={handlePhaseCompletion} />;
        case TradingPhase.TRADER_TYPE_SELECTION:
          return <TraderTypesSelection onSelect={handlePhaseCompletion} />;
        case TradingPhase.PROFESSIONAL_TRADER_PROFILE:
          return <ProfessionalTraderProfile />;
        case TradingPhase.PROFESSIONAL_TRADER_DASHBOARD:
          return <ProfessionalTraderDashboard />;
        case TradingPhase.PROFESSIONAL_TRADER_CALLS:
          return <ProfessionalTraderCalls
            onSelectPlatform={onSelectPlatform}
            selectedPlatform={selectedPlatform}
           />;
        case TradingPhase.PROFESSIONAL_TRADER_CONTENT_MANAGEMENT:
          return <ProfessionalTraderContentManagement />;
        // Add cases for rendering other sub-phases or components
        default:
          return (
            <div>
              <ProfessionalTraderProfile />
              <ProfessionalTraderDashboard />
              <ProfessionalTraderCalls
                onSelectPlatform={onSelectPlatform}
                selectedPlatform={selectedPlatform}
              />
              <ProfessionalTraderContentManagement />
              <ProfessionalTraderAlerts />
              <ProfessionalTraderCollaboration />
              <ProfessionalTraderCalendar />
              <ProfessionalTraderDocuments />
             
              {/* Render additional sub-phases/components */}
            </div>
          );
      }
    }
  };

  return (
    <div>
      <h2>Crypto Trading Phase</h2>
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

export default CryptoTradingPhase;
export { TradingPhase };
