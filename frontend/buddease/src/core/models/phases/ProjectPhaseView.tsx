// ProjectPhaseView.tsx
// During Project Phases - Specifically Data Analysis Phase
import LoadFluenceState from './dashboards/LoadFluenceState';

const ProjectPhaseView = ({ currentPhase }: { currentPhase: string }) => {
  
  return (
    <div>
      <h1>{currentPhase} Phase</h1>
      
      {/* Render Fluence specifically during data analysis phase */}
      {currentPhase === 'data-analysis' && (
        <div className="phase-specific-tools">
          <h2>Data Analysis Tools</h2>
          <LoadFluenceState />
          <p>Use Fluence to analyze project data and gain insights...</p>
        </div>
      )}
      
      {currentPhase === 'crypto-integration' && (
        <div className="phase-specific-tools">
          <h2>Crypto Integration Tools</h2>
          <LoadFluenceState />
          <p>Analyze crypto market data for your project...</p>
        </div>
      )}
    </div>
  );
};