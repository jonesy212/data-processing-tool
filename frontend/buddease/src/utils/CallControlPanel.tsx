// CallControlPanel.tsx
import { useErrorHandling } from '@/core/hooks/useErrorHandling';
import CallButton from '@/utils/web3/CallButton';
import { onAudioCallStart, onVideoCallStart } from '@/utils/web3/commonUtils';
import React from 'react';

const CallControlPanel: React.FC = () => {
  const { error, clearError } = useErrorHandling();

  return (
    <div>
      <h2>Call Control Panel</h2>
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={clearError}>Clear Error</button>
        </div>
      )}
      <CallButton onClick={onAudioCallStart} label="Start Audio Call" />
      <CallButton onClick={onVideoCallStart} label="Start Video Call" />
    </div>
  );
};

export default CallControlPanel;
