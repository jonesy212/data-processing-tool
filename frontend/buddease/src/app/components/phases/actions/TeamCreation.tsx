import { useAuth } from "@/app/components/auth/AuthContext";
 import React, { useState } from "react";
import TeamData from "../../models/teams/TeamData";

import TeamCreationConfirmationPage from "@/app/pages/teams/TeamCreationConfirmationPage";
import TeamCreationQuestionnaire from "@/app/pages/teams/TeamCreationQuestionnaire";
import * as TeamCreationAPI from "../../../../app/api/ApiTeam";
import { NotificationTypeEnum, useNotification } from "../../support/NotificationContext";
import { TeamCreationPhase } from "./TeamCreationManager";
import axiosInstance from "../../security/csrfToken";

const TeamCreationPhaseManager: React.FC = () => {
  const { state } = useAuth();
  const { notify } = useNotification();
  const [currentPhase, setCurrentPhase] = useState<TeamCreationPhase>(
    TeamCreationPhase.QUESTIONNAIRE
  );

  const [teamData, setTeamData] = useState<TeamData | null>(null);

  const handleQuestionnaireSubmit = async (teamResponses: any) => {
    try {
      const response = await axiosInstance.get("/teams/create", {
        data: teamResponses,
      });

      // Call API to create team
      await TeamCreationAPI.createTeam(teamData!);

      // Handle the server response if needed
      console.log("Server response:", response.data);

      // Update team data locally
      setTeamData({
        ...teamData!,
        ...teamResponses,
      });

      // Transition to the confirmation phase
      setCurrentPhase(TeamCreationPhase.CONFIRMATION);

      // Notify user of successful team creation
      notify(
        "teamCreationSuccess" + teamData!._id,
        "Your team has been successfully created",
        "TeamCreationSuccess",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error: any) {
      // Handle any network or unexpected errors
      console.error("Error creating team:", error);
      notify(
        "teamCreationError" + error.message,
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
      const response = await axiosInstance.post("/teams/confirm", teamData);

      await TeamCreationAPI.confirmTeamCreation(Number(teamData));

      // Handle the server response if needed
      console.log("Server response:", response.data);

      // Notify user of successful team confirmation
      notify(
        "teamConfirmationSuccess" + teamData.id,
        "Your team has been successfully confirmed",
        "TeamConfirmationSuccess",
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );

      // Perform additional actions as needed, such as updating the UI or navigating to a different page
    } catch (error: any) {
      // Handle any network or unexpected errors
      console.error("Error confirming team creation:", error);
      notify(
        "teamConfirmationError" + error.message,
        "There was an error confirming your team, please try again",
        "TeamConfirmationError",
        new Date(),
        NotificationTypeEnum.OperationError
      );
    }
  };

  const confirmTeamCreation = async (teamData: TeamData) => {
    try {
      // Send confirmation request to the server using Axios
      const response = await TeamCreationAPI.confirmTeamCreation(
        Number(teamData)
      );

      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <div>
      {currentPhase === TeamCreationPhase.QUESTIONNAIRE && (
        <TeamCreationQuestionnaire onSubmit={handleQuestionnaireSubmit} />
      )}
      {currentPhase === TeamCreationPhase.CONFIRMATION && teamData && (
        <TeamCreationConfirmationPage
          teamData={teamData}
          onConfirm={() => handleConfirmation(teamData)}
        />
      )}
    </div>
  );
};

export default TeamCreationPhaseManager;
export { TeamCreationPhase };



