// ProjectWithCryptoIntegration.tsx
import { useCryptoIntegration } from '@/app/hooks/useCryptoIntegration';
// Example usage in a React component
const ProjectWithCryptoIntegration: React.FC = () => {
  const { portfolio, fundProjectPhase, isCryptoEnabled } = useCryptoIntegration(currentUser.id);
  const [currentProject, setCurrentProject] = useState(null);

  // Fund the ideation phase using Bitcoin
  const handleFundIdeationPhase = async () => {
    try {
      await fundProjectPhase(
        currentProject.id,
        'ideation-phase',
        0.1, // 0.1 BTC
        'BTC'
      );
      
      // Show success message
      alert('Project phase funded successfully with Bitcoin!');
    } catch (error) {
      // Handle environment-specific errors
      if (error.message.includes('not available in this environment')) {
        alert('Crypto funding is only available in development and staging environments during testing');
      } else if (error.message.includes('exceeds the limit')) {
        alert('Funding amount exceeds the limit for this environment. Please contact support.');
      }
    }
  };

  return (
    <div>
      <h2>Project: {currentProject?.name}</h2>
      
      {/* Crypto Portfolio Section */}
      {isCryptoEnabled && portfolio && (
        <div className="crypto-dashboard">
          <h3>Your Crypto Portfolio: ${portfolio.totalValue.toLocaleString()}</h3>
          <button onClick={handleFundIdeationPhase}>
            Fund Ideation Phase with Crypto
          </button>
        </div>
      )}
      
      {/* Environment Info */}
      <div className="environment-info">
        <small>
          Environment: {environmentAwareEndpointManager.getCurrentEnvironment().name}
          {!isCryptoEnabled && " (Crypto features disabled)"}
        </small>
      </div>
    </div>
  );
};