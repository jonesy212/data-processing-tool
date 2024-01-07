import { useAuth } from "@/app/components/auth/AuthContext";
import axios from "axios";
import React, { useEffect, useState } from "react";

enum DataAnalysisSubPhase {
  DEFINE_OBJECTIVE,
  DATA_COLLECTION,
  CLEAN_DATA,
  DATA_ANALYSIS,
  DATA_VISUALIZATION,
  TRANSFORM_INSIGHTS,
}

interface DataAnalysisPhaseProps {
  onSubmit: () => void;
}

const DataAnalysisPhase: React.FC<DataAnalysisPhaseProps> = ({ onSubmit }) => {
  const { state } = useAuth();
  const [currentSubPhase, setCurrentSubPhase] = useState<DataAnalysisSubPhase>(
    DataAnalysisSubPhase.DEFINE_OBJECTIVE
  );

  useEffect(() => {
    // Access state.user or other properties from the auth context if needed
    const userEmail = state.user?.email;
    const userId = state.user?.id;

    // Fetch additional data using Axios or perform other asynchronous operations
    const fetchData = async () => {
      try {
        // Example: Fetch user-specific data from the server
        const userSpecificData = await axios.get(`/api/user/${userId}`);
        console.log("User-specific data:", userSpecificData.data);

        // Additional Axios requests or asynchronous operations as needed
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Call the fetchData function when the component mounts
    fetchData();
  }, [state, currentSubPhase]); // Include currentSubPhase if needed in the dependency array

  const handleSubPhaseCompletion = async () => {
    switch (currentSubPhase) {
      case DataAnalysisSubPhase.DEFINE_OBJECTIVE:
        // Logic for completing the "Define Objective" sub-phase
        break;
      case DataAnalysisSubPhase.DATA_COLLECTION:
        // Logic for completing the "Data Collection" sub-phase
        break;
      case DataAnalysisSubPhase.CLEAN_DATA:
        // Logic for completing the "Clean Data" sub-phase
        break;
      case DataAnalysisSubPhase.DATA_ANALYSIS:
        // Logic for completing the "Data Analysis" sub-phase
        break;
      case DataAnalysisSubPhase.DATA_VISUALIZATION:
        // Logic for completing the "Data Visualization" sub-phase
        break;
      case DataAnalysisSubPhase.TRANSFORM_INSIGHTS:
        // Logic for completing the "Transform Insights" sub-phase
        break;
      default:
        break;
    }

    const nextSubPhase = currentSubPhase + 1;
    setCurrentSubPhase(nextSubPhase);

    if (nextSubPhase > DataAnalysisSubPhase.TRANSFORM_INSIGHTS) {
      onSubmit();
    }
  };

  return (
    <div>
      <h1>Data Analysis Phase</h1>

      {currentSubPhase === DataAnalysisSubPhase.DEFINE_OBJECTIVE && (
        <div>
          <p>Define the objective of your data analysis.</p>
          {/* Add form elements or UI components as needed */}
        </div>
      )}

      {currentSubPhase === DataAnalysisSubPhase.DATA_COLLECTION && (
        <div>
          <p>Collect or upload the necessary data for analysis.</p>
          {/* Add form elements or UI components as needed */}
        </div>
      )}

      {currentSubPhase === DataAnalysisSubPhase.CLEAN_DATA && (
        <div>
          <p>
            Ensure the data is clean, free from errors or inconsistencies.
            Handle missing values, outliers, and any data quality issues.
          </p>
          {/* Add form elements or UI components as needed */}
        </div>
      )}

      {currentSubPhase === DataAnalysisSubPhase.DATA_ANALYSIS && (
        <div>
          <p>
            Utilize statistical methods, machine learning algorithms, or other
            analytical techniques to uncover patterns, trends, and insights
            within the data.
          </p>
          {/* Add form elements or UI components as needed */}
        </div>
      )}

      {currentSubPhase === DataAnalysisSubPhase.DATA_VISUALIZATION && (
        <div>
          <p>
            Present the results visually through charts, graphs, or dashboards
            to facilitate easier understanding and interpretation.
          </p>
          {/* Add form elements or UI components as needed */}
        </div>
      )}

      {currentSubPhase === DataAnalysisSubPhase.TRANSFORM_INSIGHTS && (
        <div>
          <p>
            Translate the insights gained from the analysis into actionable
            strategies, business opportunities, or decision-making processes.
          </p>
          {/* Add form elements or UI components as needed */}
        </div>
      )}

      {/* Button to move to the next sub-phase */}
      <button onClick={handleSubPhaseCompletion}>Next</button>
    </div>
  );
};

export default DataAnalysisPhase;
