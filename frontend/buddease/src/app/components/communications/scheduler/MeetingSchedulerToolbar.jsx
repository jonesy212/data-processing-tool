import { observer } from 'mobx-react';
import React from 'react';
import { useStore } from '../store/StoreProvider'; // Assuming you have a MobX store

const MeetingSchedulerToolbar = observer(() => {
  const store = useStore(); // Access the MobX store

  const handleProposeMeetingTime = () => {
    // Handle propose meeting time action
    store.proposeMeetingTime();
  };

  const handleSendInvitations = () => {
    // Handle send invitations action
    store.sendInvitations();
  };

  return (
    <div>
      {/* Propose meeting time */}
      <button onClick={handleProposeMeetingTime}>Propose Meeting Time</button>
      {/* Send invitations */}
      <button onClick={handleSendInvitations}>Send Invitations</button>
      {/* Add more options as needed */}
    </div>
  );
});

export default MeetingSchedulerToolbar;
