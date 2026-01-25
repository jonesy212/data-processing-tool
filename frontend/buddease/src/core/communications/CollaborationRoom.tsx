// CollaborationRoom.tsx
// During Real-Time Collaboration

import LoadFluenceState from './dashboards/LoadFluenceState';

const CollaborationRoom = ({ meetingType }: { meetingType: 'brainstorming' | 'data-analysis' | 'crypto-planning' }) => {
  
  return (
    <div className="collaboration-room">
      <VideoConference />
      <Chat />
      
      {/* Render Fluence for data analysis meetings */}
      {meetingType === 'data-analysis' && (
        <div className="data-analysis-panel">
          <h3>Real-Time Data Analysis with Fluence</h3>
          <LoadFluenceState />
        </div>
      )}
      
      {/* Or for crypto planning sessions */}
      {meetingType === 'crypto-planning' && (
        <div className="crypto-analysis-panel">
          <h3>Crypto Market Insights</h3>
          <LoadFluenceState />
        </div>
      )}
    </div>
  );
};