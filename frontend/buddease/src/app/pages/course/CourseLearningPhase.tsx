// CourseLearningPhase.tsx
import { Data } from '@/app/components/models/data/Data';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import React, { useState } from 'react';
import { CourseDevelopmentPhase } from './CourseDevelopmentPhaseManager';

interface CourseLearningPhaseProps {
  onSubmit: (data: any) => void;
  setCurrentPhase: React.Dispatch<React.SetStateAction<CourseDevelopmentPhase>>;
  userData: SnapshotStore<Snapshot<Data<any>, Data<any>>>[];
}



const CourseLearningPhase: React.FC<CourseLearningPhaseProps> = ({ onSubmit, userData }) => {
  // State to manage learning phase data
  const [learningData, setLearningData] = useState({
    modulesCompleted: '',
    quizzesCompleted: '',
    progress: '',
  });

  // Function to handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Perform validation if needed
    // Submit learning data to backend or perform other actions
    onSubmit(learningData);
  };

  return (
    <div>
      <h2>Course Learning Phase</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="modulesCompleted">Modules Completed:</label>
        <input
          type="text"
          id="modulesCompleted"
          value={learningData.modulesCompleted}
          onChange={(e) => setLearningData({ ...learningData, modulesCompleted: e.target.value })}
          required
        />
        <br />
        <label htmlFor="quizzesCompleted">Quizzes Completed:</label>
        <input
          type="text"
          id="quizzesCompleted"
          value={learningData.quizzesCompleted}
          onChange={(e) => setLearningData({ ...learningData, quizzesCompleted: e.target.value })}
          required
        />
        <br />
        <label htmlFor="progress">Progress:</label>
        <input
          type="text"
          id="progress"
          value={learningData.progress}
          onChange={(e) => setLearningData({ ...learningData, progress: e.target.value })}
          required
        />
        <br />
        <button type="submit">Submit Learning Data</button>
      </form>
    </div>
  );
};

export default CourseLearningPhase;
