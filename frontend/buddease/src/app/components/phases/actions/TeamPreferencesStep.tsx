// TeamPreferencesStep.tsx
import React, { useState } from 'react';

const TeamPreferencesStep: React.FC<{ onSubmit: (preferences: any) => void }> = ({ onSubmit }) => {
  const [preferences, setPreferences] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  return (
    <div>
      <h2>Team Preferences</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="preferences">Enter team preferences:</label>
          <input
            type="text"
            id="preferences"
            value={preferences}
            onChange={handleInputChange}
            placeholder="Enter preferences"
          />
        </div>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default TeamPreferencesStep;
