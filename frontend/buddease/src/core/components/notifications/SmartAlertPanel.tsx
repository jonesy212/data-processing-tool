// SmartAlertPanel.tsx
// As Part of Your Unified Notification/Alert System

import LoadFluenceState from './dashboards/LoadFluenceState';

const SmartAlertPanel = ({ alertType }: { alertType: 'crypto' | 'project' | 'collaboration' }) => {
  
  return (
    <div className="smart-alert-panel">
      <h3>Intelligent Alerts</h3>
      
      {alertType === 'crypto' && (
        <>
          <p>Market movement detected. Running advanced analysis...</p>
          <LoadFluenceState />
          <button>View Detailed Report</button>
        </>
      )}
    </div>
  );
};