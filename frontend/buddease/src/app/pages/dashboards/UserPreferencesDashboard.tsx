// UserPreferencesDashboard.tsx
import React from "react";
import userPreferences, { UserPreferences } from '@/app/configs/UserPreferences';

const UserPreferencesDashboard: React.FC = () => {
  // Extract the required properties from UserPreferences
  const { modules, actions, reducers, ...otherPreferences } = userPreferences;

  // Return your JSX here, integrating the extracted properties
  return (
    <div>
      <h2>User Preferences Dashboard</h2>
      <p>Modules: {modules}</p>
      <p>Actions: {actions.join(", ")}</p>
      <p>Reducers: {reducers.join(", ")}</p>
      {/* Render other preferences as needed */}
      {/* For example: */}
      <p>Other Preferences:</p>
      <pre>{JSON.stringify(otherPreferences, null, 2)}</pre>
    </div>
  );
};

export default UserPreferencesDashboard;
