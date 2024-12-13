import { useAuth } from '@/app/components/auth/AuthContext';
import { Data } from '@/app/components/models/data/Data';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { useNotification } from '@/app/components/support/NotificationContext';
import { fetchDataWithToken } from '@/app/components/users/ExternalApiAuth';
import React, { useState } from 'react';
import generateTimeBasedCode from '../../components/models/realtime/TimeBasedCodeGenerator';
import CourseLearningPhase from './CourseLearningPhase';
import CoursePlanningPhase from './CoursePlanningPhase';
import CourseSetupPhase from './CourseSetupPhase';


// Define course development phases
export enum CourseDevelopmentPhase {
  PLANNING,
  SETUP,
  LEARNING,
  // Add more phases as needed
}

const {notify} = useNotification()

const CourseDevelopmentPhaseManager: React.FC = () => {
  const { state } = useAuth();

  const [currentPhase, setCurrentPhase] = useState<CourseDevelopmentPhase>(
    CourseDevelopmentPhase.PLANNING // Initial phase
  );

  const timeBasedCode = generateTimeBasedCode();
  const userData = {} as SnapshotStore<Snapshot<Data, Data>>[]

  // Additional logic specific to the Course Development Phase

  // Function to handle submission logic for Course Setup Phase
  const handleSetupSubmit = async (data: any) => {
    try {
      // Perform data validation here if needed

      // Call a function to submit the data to the database
      await saveDataToDatabase(data);

      // Notify the user about successful submission
      notify('Success', 'Course setup submitted successfully!', 'success');
    } catch (error) {
      // Handle errors gracefully
      handleSubmissionError(error, 'Course setup submission failed.');
    }
  };

  // Function to handle submission logic for Course Learning Phase
  const handleLearningSubmit = async (data: any) => {
    try {
      // Perform data validation here if needed

      // Call the fetchDataWithToken function to fetch data with token
      if (!state.user?.token) { 
        notify('Error', 'Please login to submit data', 'error');
        return;
      }

      if (state.user?.token) {
        const response = await fetchDataWithToken(state.user?.token); // Pass the user token
        console.log('Data fetched with token:', response);
      }
      // Call a function to submit the data to the database
      await saveDataToDatabase(data);

      // Notify the user about successful submission
      notify('Success', 'Course learning phase completed!', 'success');
    } catch (error) {
      // Handle errors gracefully
      handleSubmissionError(error, 'Course learning phase submission failed.');
    }
  };

  // Function to save data to the database (dummy implementation for demonstration)
  const saveDataToDatabase = async (data: any) => {
    // Dummy database operation
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate asynchronous operation
    console.log('Data saved to database:', data); // Log the saved data
  };

  // Function to handle submission errors and notify the user
  const handleSubmissionError = (error: any, message: string) => {
    console.error('Submission error:', error); // Log the error
    notify('Error', message, 'error'); // Notify the user about the error
  };

  return (
    <div>
      {currentPhase === CourseDevelopmentPhase.PLANNING && (
        <CoursePlanningPhase
          setCurrentPhase={setCurrentPhase}
          onNext={() => setCurrentPhase(CourseDevelopmentPhase.SETUP)}
        />
      )}
      {currentPhase === CourseDevelopmentPhase.SETUP && (
        <CourseSetupPhase onSubmit={handleSetupSubmit} userData={userData} setCurrentPhase={setCurrentPhase} />
      )}
      {currentPhase === CourseDevelopmentPhase.LEARNING && (
        <CourseLearningPhase onSubmit={handleLearningSubmit} userData={userData} setCurrentPhase={setCurrentPhase} />
      )}
      {/* Add more sub-phase components as needed */}
      <button>{timeBasedCode}</button> {/* Displaying the time-based code */}
    </div>
  );
};

export default CourseDevelopmentPhaseManager;
