// CallControlPanel.tsx
import React from 'react';
import CallButton from '@/app/utils/CallButton';
import useErrorHandling from '@/app/hooks/useErrorHandling';
import { onAudioCallStart, onVideoCallStart } from '@/app/utils/commonUtils';

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
