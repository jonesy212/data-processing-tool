import { useAuth } from "@/app/components/auth/AuthContext";
import { useNotification } from "@/app/components/hooks/commHooks/useNotification";
import React, { useState } from "react";
import TeamData from "../../models/teams/TeamData";

import TeamCreationConfirmationPage from "@/app/pages/teams/TeamCreationConfirmationPage";
import TeamCreationQuestionnaire from "@/app/pages/teams/TeamCreationQuestionnaire";
import TeamCreationAPI from "./teamCreationAPI";
import { NotificationTypeEnum } from "../../support/NotificationContext";

enum TeamCreationPhase {
  QUESTIONNAIRE,
  CONFIRMATION,
}

const TeamCreationPhaseManager: React.FC = () => {
  const { state } = useAuth();
  const { notify } = useNotification();
  const [currentPhase, setCurrentPhase] = useState<TeamCreationPhase>(
    TeamCreationPhase.QUESTIONNAIRE
  );

  const [teamData, setTeamData] = useState<TeamData | null>(null);

  const handleQuestionnaireSubmit = async (teamResponses: any) => {
    try {
      // Example: Send team creation responses to the server using Axios
      const response = await TeamCreationAPI.createTeam(teamResponses);

      // Handle the server response if needed
      console.log("Server response:", response.data);

      // Update team data locally
      setTeamData({
        ...teamData,
        ...teamResponses,
      });

      // Transition to the confirmation phase
      setCurrentPhase(TeamCreationPhase.CONFIRMATION);

      // Notify user of successful team creation
      notify(
        "Your team has been successfully created",
        "TeamCreationSuccess",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      // Handle any network or unexpected errors
      console.error("Error creating team:", error);
      notify(
        "There was an error creating your team, please try again",
        "TeamCreationError",
        new Date(),
        NotificationTypeEnum.OperationError
      );
    }
  };

  const handleConfirmation = async (teamData: TeamData) => {
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
      {currentPhase === TeamCreationPhase.QUESTIONNAIRE && (
        <TeamCreationQuestionnaire onSubmit={handleQuestionnaireSubmit} />
      )}
      {currentPhase === TeamCreationPhase.CONFIRMATION && (
        <TeamCreationConfirmationPage
          teamData={teamData}
          onConfirm={() => handleConfirmation}
        />
      )}
    </div>
  );
};

export default TeamCreationPhaseManager;
export { TeamCreationPhase };
