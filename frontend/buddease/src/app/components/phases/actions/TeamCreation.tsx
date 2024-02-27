import { useAuth } from "@/app/components/auth/AuthContext";
import { useNotification } from "@/app/components/hooks/commHooks/useNotification";
import React, { useState } from "react";
import TeamData from "../../models/teams/TeamData";

import TeamCreationConfirmationPage from "@/app/pages/teams/TeamCreationConfirmationPage";
import TeamCreationQuestionnaire from "@/app/pages/teams/TeamCreationQuestionnaire";
import TeamCreationAPI from "./teamCreationAPI";

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


  const [teamData, setTeamData] = useState<TeamData>({
    // Initialize empty team data
  });

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

  const handleConfirmation = () => {
    // Logic for confirming team creation
    // This function can be expanded as needed
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
