// RewindButton.tsx
platform/web/RewindButton.tsx
import { SharedButton } from '@/core/components/shared/Share';
import React from 'react';

const RewindButton: React.FC = () => {
  const handleRewind = () => {
    // Web-specific rewind logic
  };

  return <SharedButton label="Rewind" onClick={handleRewind} />;
};

export default RewindButton;