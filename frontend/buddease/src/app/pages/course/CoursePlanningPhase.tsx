// CoursePlanningPhase.tsx
import React, { useState } from 'react';
import { CourseDevelopmentPhase } from './CourseDevelopmentPage';

interface CoursePlanningPhasePros {
    onNext: () => void;
    setCurrentPhase: React.Dispatch<React.SetStateAction<CourseDevelopmentPhase>>
}

const CoursePlanningPhase: React.FC<CoursePlanningPhasePros> = ({ onNext,setCurrentPhase }) => {
  // State to manage planning phase data
  const [plan, setPlan] = useState('');

  // Function to handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Perform validation if needed
    // Save plan data to backend or perform other actions
    console.log('Plan submitted:', plan);
    // Move to the next phase
    onNext();
  };

  return (
    <div>
      <h2>Course Planning Phase</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="plan">Plan:</label>
        <textarea
          id="plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="Enter your course plan"
          required
        ></textarea>
        <br />
        <button type="submit">Submit Plan</button>
      </form>
    </div>
  );
};

export default CoursePlanningPhase;
