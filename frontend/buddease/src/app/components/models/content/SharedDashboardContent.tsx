// SharedDashboardContent.tsx
import React from 'react'

interface SharedDashboardContentProps {
  onlineStatus: boolean;
  activeCalls: number;
  toggleOnlineStatus: () => void;
  increaseActiveCalls: () => void;
  decreaseActiveCalls: () => void;
}

export const SharedDashboardContent: React.FC<SharedDashboardContentProps> = ({
  onlineStatus,
  activeCalls,
  toggleOnlineStatus,
  increaseActiveCalls,
  decreaseActiveCalls,
}) => {
  return (
    <div>
      {/* Shared content for both dashboards */}
      <p>Online Status: {onlineStatus ? 'Online' : 'Offline'}</p>
      <button onClick={toggleOnlineStatus}>Toggle Online Status</button>
      <p>Active Calls: {activeCalls}</p>
      <button onClick={increaseActiveCalls}>Increase Active Calls</button>
      <button onClick={decreaseActiveCalls}>Decrease Active Calls</button>
    </div>
  );
};

export default SharedDashboardContent;
