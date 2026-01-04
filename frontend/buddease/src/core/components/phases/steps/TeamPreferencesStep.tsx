TeamPreferencesStep.tsx

import PreferencesStep from '@/core/components/phases/steps/PreferencesStep';
import React from 'react';

const TeamPreferencesStep: React.FC<{ onSubmit: (preferences: any) => void }> = ({ onSubmit }) => {
  return (
    <PreferencesStep
      title="Team Preferences"
      label="Enter team preferences"
      inputType="text"
      initialValue=""
      onSubmit={onSubmit}
    />
  );
};

export default TeamPreferencesStep;

