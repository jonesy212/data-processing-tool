// RewindButton.tsx
// platform/web/RewindButton.tsx
import React from 'react';
import { SharedButton } from '@/app/components/shared/Share'

const RewindButton: React.FC = () => {
  const handleRewind = () => {
    // Web-specific rewind logic
  };

  return <SharedButton label="Rewind" onClick={handleRewind} />;
};

export default RewindButton;