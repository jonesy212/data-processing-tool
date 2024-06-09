import React, { useState } from 'react';

interface ProgressDataProps {
  progress: number; // Progress value
  value: string; // Additional metadata value
}

const ProgressDataComponent: React.FC<ProgressDataProps> = ({ progress }) => {
  const [currentProgress, setCurrentProgress] = useState(progress);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentProgress(Number(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle submission of progress data, such as saving to a database or dispatching an action
    console.log("Submitting progress data:", currentProgress);
  };

  return (
    <div>
      <h4>Progress Data</h4>
      <form onSubmit={handleSubmit}>
        <label htmlFor="progressInput">Progress:</label>
        <input
          type="number"
          id="progressInput"
          value={currentProgress}
          onChange={handleProgressChange}
          min={0}
          max={100}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ProgressDataComponent;
export type { ProgressDataProps };
