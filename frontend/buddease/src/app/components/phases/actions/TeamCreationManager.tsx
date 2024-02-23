// TeamCreationManager.tsx
import axiosInstance from "@/app/api/axiosInstance";
import { useNotification } from "@/app/components/hooks/commHooks/useNotification";
import { useState } from "react";
import TeamBasicInfoStep from "./TeamBasicInfoStep";
import TeamMembersStep from "./TeamMembersStep";
import TeamPreferencesStep from "./TeamPreferencesStep";
import TeamReviewStep from "./TeamReviewStep";
import TeamSummaryStep from "./TeamSummaryStep";

export enum TeamCreationPhase {
  BASIC_INFO,
  MEMBERS,
  PREFERENCES,
  REVIEW,
  SUMMARY,
}

const TeamCreationManager: React.FC = () => {
  const { notify } = useNotification();
  const [currentStep, setCurrentStep] = useState<TeamCreationPhase>(
    TeamCreationPhase.BASIC_INFO
  );

  // Define state to hold team data throughout the creation process
  const [teamData, setTeamData] = useState<any>({
    // Initialize with default values or empty objects as needed
  });

  // Function to handle submitting basic info step
  const handleBasicInfoSubmit = (basicInfo: any) => {
    // Update teamData with basic info
    setTeamData({ ...teamData, basicInfo });

    // Move to the next step (MEMBERS)
    setCurrentStep(TeamCreationPhase.MEMBERS);
  };

  // Function to handle submitting members step
  const handleMembersSubmit = (members: any) => {
    // Update teamData with members info
    setTeamData({ ...teamData, members });

    // Move to the next step (PREFERENCES)
    setCurrentStep(TeamCreationPhase.PREFERENCES);
  };

  // Function to handle submitting preferences step
  const handlePreferencesSubmit = (preferences: any) => {
    // Update teamData with preferences info
    setTeamData({ ...teamData, preferences });

    // Move to the next step (REVIEW)
    setCurrentStep(TeamCreationPhase.REVIEW);
  };

  // Function to handle submitting review step
  const handleReviewSubmit = async () => {
    try {
      // Send teamData to the server using Axios
      const response = await axiosInstance.post("/api/team-creation", teamData);

      // Handle success response
      console.log("Server response:", response.data);

      // Move to the final step (SUMMARY)
      setCurrentStep(TeamCreationPhase.SUMMARY);

      // Notify user of successful team creation
      notify("Team has been successfully created", "success");
    } catch (error) {
      // Handle error
      console.error("Error creating team:", error);
      notify("Error creating team", "error");
    }
  };

  return (
    <div>
      {currentStep === TeamCreationPhase.BASIC_INFO && (
        <TeamBasicInfoStep onSubmit={handleBasicInfoSubmit} />
      )}
      {currentStep === TeamCreationPhase.MEMBERS && (
        <TeamMembersStep onSubmit={handleMembersSubmit} />
      )}
      {currentStep === TeamCreationPhase.PREFERENCES && (
        <TeamPreferencesStep onSubmit={handlePreferencesSubmit} />
      )}
      {currentStep === TeamCreationPhase.REVIEW && (
        <TeamReviewStep onSubmit={handleReviewSubmit} />
      )}
      {currentStep === TeamCreationPhase.SUMMARY && <TeamSummaryStep />}
    </div>
  );
};

export default TeamCreationManager;
