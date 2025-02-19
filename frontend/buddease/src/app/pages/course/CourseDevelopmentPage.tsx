// CourseDevelopmentPage.tsx
import { fetchDataWithToken, useAuth } from "@/app/components/auth/AuthContext";
import { Data } from "@/app/components/models/data/Data";
import SnapshotStore, {
    Snapshot,
} from "@/app/components/snapshots/SnapshotStore";
import { useNotification } from "@/app/components/support/NotificationContext";
import React, { useEffect, useState } from "react";
import generateTimeBasedCode from "../../components/models/realtime/TimeBasedCodeGenerator";
import CourseLearningPhase from "./CourseLearningPhase";
import CoursePlanningPhase from "./CoursePlanningPhase";
import CourseSetupPhase from "./CourseSetupPhase";

const { notify } = useNotification();
// Define course development phases
export enum CourseDevelopmentPhase {
  PLANNING,
  SETUP,
  LEARNING,
  // Add more phases as needed
}

const CourseDevelopmentPhaseManager: React.FC = () => {
  const { state } = useAuth();
  const [timeBasedCode, setTimeBasedCode] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<CourseDevelopmentPhase>(
    CourseDevelopmentPhase.PLANNING // Initial phase
  );

  const userData = {} as SnapshotStore<Snapshot<Data, Data>>[];

  // Additional logic specific to the Course Development Phase

  // Function to handle submission logic for Course Setup Phase
  const handleSetupSubmit = async (data: any) => {
    try {
      // Perform data validation here if needed

      // Call a function to submit the data to the database
      await saveDataToDatabase(data);

      // Notify the user about successful submission
      notify("Success", "Course setup submitted successfully!", "success");
    } catch (error) {
      // Handle errors gracefully
      handleSubmissionError(error, "Course setup submission failed.");
    }
  };

  // Function to handle submission logic for Course Learning Phase
  const handleLearningSubmit = async (data: any) => {
    try {
      // Perform data validation here if needed

      // Call a function to submit the data to the database
      await saveDataToDatabase(data);

      // Notify the user about successful submission
      notify("Success", "Course learning phase completed!", "success");
    } catch (error) {
      // Handle errors gracefully
      handleSubmissionError(error, "Course learning phase submission failed.");
    }
  };

  // Function to save data to the database (dummy implementation for demonstration)
  const saveDataToDatabase = async (data: any) => {
    // Dummy database operation
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate asynchronous operation
    console.log("Data saved to database:", data); // Log the saved data
  };

  // Function to handle submission errors and notify the user
  const handleSubmissionError = (error: any, message: string) => {
    console.error("Submission error:", error); // Log the error
    notify("Error", message, "error"); // Notify the user about the error
  };

  // Function to fetch data with authentication token
  const fetchCourseData = async () => {
    try {
      const data = await fetchDataWithToken();
      console.log("Fetched data:", data);
    } catch (error) {
      console.error("Fetching data failed:", error);
      notify("Error", "Fetching data failed", "error");
    }
  };

  // Function to generate time-based code
  const generateTimeCode = () => {
    const newTimeBasedCode = generateTimeBasedCode();
    setTimeBasedCode(newTimeBasedCode);
  };

  // Call generateTimeCode function when component mounts
  useEffect(() => {
    generateTimeCode();
  }, []);

  // Conditionally render content based on authentication state
  const renderContent = () => {
    if (state.isAuthenticated) {
      return (
        <>
          {currentPhase === CourseDevelopmentPhase.PLANNING && (
            <CoursePlanningPhase
              setCurrentPhase={setCurrentPhase}
              onNext={() => setCurrentPhase(CourseDevelopmentPhase.SETUP)}
            />
          )}
          {currentPhase === CourseDevelopmentPhase.SETUP && (
            <CourseSetupPhase
              onSubmit={handleSetupSubmit}
              userData={userData}
              setCurrentPhase={setCurrentPhase}
            />
          )}
          {currentPhase === CourseDevelopmentPhase.LEARNING && (
            <CourseLearningPhase
              onSubmit={handleLearningSubmit}
              userData={userData}
              setCurrentPhase={setCurrentPhase}
            />
          )}
          <button onClick={fetchCourseData}>Fetch Data</button>
          {/* Display or use the generated time-based code */}
          <p>Time-based Code: {timeBasedCode}</p>
        </>
      );
    } else {
      return <p>Please log in to view content.</p>;
    }
  };

  return (
    <div>
      {renderContent()}
      {/* Accessing and using the authentication state */}
      <p>
        Authentication State:{" "}
        {state.isAuthenticated ? "Authenticated" : "Not Authenticated"}
      </p>
    </div>
  );
};

export default CourseDevelopmentPhaseManager;
