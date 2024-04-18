// TeamCreationManager.tsx
import axiosInstance from "@/app/api/axiosInstance";
import { useNotification } from "@/app/components/hooks/commHooks/useNotification";
import { useState } from "react";



import TeamBasicInfoStep from "./TeamBasicInfoStep";
import TeamMembersStep from "./TeamMembersStep";
import TeamPreferencesStep from "./TeamPreferencesStep";
import TeamReviewStep from "./TeamReviewStep";
import TeamSummaryStep from "./TeamSummaryStep";
import TeamCreationConfirmationPage from "@/app/pages/teams/TeamCreationConfirmationPage";
import { NotificationTypeEnum } from "../../support/NotificationContext";

export enum TeamCreationPhase {
  BASIC_INFO,
  MEMBERS,
  PREFERENCES,
  REVIEW,
  QUESTIONNAIRE,
  CONFIRMATION,
}

const TeamCreationManager: React.FC = () => {

  const TeamCreationManager: React.FC = () => {
    const { notify } = useNotification();
    const [currentStep, setCurrentStep] = useState<TeamCreationPhase>(
      TeamCreationPhase.BASIC_INFO
    );
  
    const [teamData, setTeamData] = useState<any>({
      // Initialize with default values or empty objects as needed
    });
  
    const handleBasicInfoSubmit = (basicInfo: any) => {
      setTeamData({ ...teamData, basicInfo });
      setCurrentStep(TeamCreationPhase.MEMBERS);
    };
  
    const handleMembersSubmit = (members: any) => {
      setTeamData({ ...teamData, members });
      setCurrentStep(TeamCreationPhase.PREFERENCES);
    };
  
    const handlePreferencesSubmit = (preferences: any) => {
      setTeamData({ ...teamData, preferences });
      setCurrentStep(TeamCreationPhase.REVIEW);
    };
  
    const handleReviewSubmit = async () => {
      try {
        const response = await axiosInstance.post("/api/team-creation", teamData);
        console.log("Server response:", response.data);
        setCurrentStep(TeamCreationPhase.CONFIRMATION);
        notify("Team has been successfully created", "success");
      } catch (error) {
        console.error("Error creating team:", error);
        notify("Error creating team", "error");
      }
    };
  
    const handleConfirmation = async (teamData: any) => {
      try {
        // Example: Send confirmation request to the server using Axios
        const response = await TeamCreationAPI.confirmTeamCreation(teamData);
  
        // Handle the server response if needed
        console.log("Server response:", response.data);
  
        // Notify user of successful team confirmation
        notify(
          "Your team has been successfully confirmed",
          "TeamConfirmationSuccess",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
  
        // Perform additional actions as needed, such as updating the UI or navigating to a different page
      } catch (error) {
        // Handle any network or unexpected errors
        console.error("Error confirming team creation:", error);
        notify(
          "There was an error confirming your team, please try again",
          "TeamConfirmationError",
          new Date(),
          NotificationTypeEnum.OperationError
        );
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
        {currentStep === TeamCreationPhase.CONFIRMATION && (
          <TeamCreationConfirmationPage
            teamData={teamData}
            onConfirm={() => handleConfirmation(teamData)}
          />
        )}
      </div>
    );
  };
  
  export default TeamCreationManager;
