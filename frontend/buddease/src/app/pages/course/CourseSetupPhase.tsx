import { Data } from "@/app/components/models/data/Data";
import SnapshotStore, {
    Snapshot,
} from "@/app/components/snapshots/SnapshotStore";
import React, { useState } from "react";
import { CourseDevelopmentPhase } from "./CourseDevelopmentPhaseManager";

interface CourseSetupPhaseProps {
  onSubmit: (data: any) => void;
  setCurrentPhase: React.Dispatch<React.SetStateAction<CourseDevelopmentPhase>>;
  userData: SnapshotStore<Snapshot<Data, Data>>[];
}

const CourseSetupPhase: React.FC<CourseSetupPhaseProps> = ({
  onSubmit,
  setCurrentPhase,
  userData,
}) => {
  // State to manage setup phase data
  const [setupData, setSetupData] = useState({
    courseName: "",
    instructor: "",
    duration: "",
    description: "",
  });

  // Function to handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Perform validation if needed
    // Submit setup data to backend or perform other actions
    onSubmit(setupData);
  };

  return (
    <div>
      <h2>Course Setup Phase</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="courseName">Course Name:</label>
        <input
          type="text"
          id="courseName"
          value={setupData.courseName}
          onChange={(e) =>
            setSetupData({ ...setupData, courseName: e.target.value })
          }
          required
        />
        <br />
        <label htmlFor="instructor">Instructor:</label>
        <input
          type="text"
          id="instructor"
          value={setupData.instructor}
          onChange={(e) =>
            setSetupData({ ...setupData, instructor: e.target.value })
          }
          required
        />
        <br />
        <label htmlFor="duration">Duration:</label>
        <input
          type="text"
          id="duration"
          value={setupData.duration}
          onChange={(e) =>
            setSetupData({ ...setupData, duration: e.target.value })
          }
          required
        />
        <br />
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={setupData.description}
          onChange={(e) =>
            setSetupData({ ...setupData, description: e.target.value })
          }
          placeholder="Enter course description"
          required
        ></textarea>
        <br />
        <button type="submit">Submit Setup</button>
      </form>
    </div>
  );
};

export default CourseSetupPhase;
