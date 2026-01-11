// CryptoDashboard.tsx
// CryptoDashboard.tsx
import LoadFluenceState from './dashboards/LoadFluenceState';

const CryptoDashboard = () => {
  const [showFluence, setShowFluence] = useState(false);
  
  return (
    <div>
      <h1>Your Crypto Portfolio</h1>
      
      {/* Trigger Fluence during crypto analysis */}
      <button onClick={() => setShowFluence(!showFluence)}>
        {showFluence ? 'Hide Advanced Analysis' : 'Show Advanced Analysis with Fluence'}
      </button>
      
      {showFluence && (
        <div className="fluence-analysis-panel">
          <h2>Advanced Crypto Analysis</h2>
          <LoadFluenceState />
          {/* Fluence would provide real-time market insights, predictions, etc. */}
        </div>
      )}
      
      {/* Rest of crypto dashboard... */}
    </div>
  );
};