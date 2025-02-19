// TeamPreferencesStep.tsx
import React from 'react';
import PreferencesStep from './PreferencesStep';

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

