// UserSettingsForm.tsx
import React from'react';
import { useState } from 'react';

interface UserSettingsFormProps {
  onSubmit: (duration: number) => void;
}


const UserSettingsForm = ({ onSubmit }: { onSubmit: (duration: number) => void }) => {
  const [timeoutDuration, setTimeoutDuration] = useState(300); // Default duration is 5 minutes (300 seconds)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(timeoutDuration);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Idle Timeout Duration (seconds):
        <input
          type="number"
          value={timeoutDuration}
          onChange={(e) => setTimeoutDuration(parseInt(e.target.value))}
        />
      </label>
      <button type="submit">Save</button>
    </form>
  );
};

export default UserSettingsForm;
