// PreferencesStep.tsx
import React, { useState } from "react";

// Generic Preferences Step Component
const PreferencesStep: React.FC<{
  title: string;
  label: string;
  inputType: string;
  initialValue: any;
  onSubmit: (preferences: any) => void;
}> = ({ title, label, inputType, initialValue, onSubmit }) => {
  const [preferences, setPreferences] = useState<any>(initialValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  return (
    <div>
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="preferences">{label}</label>
          <input
            type={inputType}
            id="preferences"
            value={preferences}
            onChange={handleInputChange}
            placeholder={`Enter ${label}`}
          />
        </div>
        <button type="submit">Next</button>
      </form>
    </div>
  );
};

export default PreferencesStep;
