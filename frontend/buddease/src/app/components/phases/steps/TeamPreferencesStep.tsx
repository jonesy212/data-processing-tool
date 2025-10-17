// TeamPreferencesStep.tsx

import React from 'react';
import PreferencesStep from '@/app/components/phases/steps/PreferencesStep';

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

