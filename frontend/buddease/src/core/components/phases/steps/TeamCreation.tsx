// TeamCreation.tsx
import { TeamData } from "@/core/models/teams/TeamData";
import { useAuth } from "@/core/state/context/AuthContext";
import React, { useState } from "react";

import * as TeamCreationAPI from "@/core/api/ApiTeam";
import axiosInstance from '@/core/api/csrfToken';
import { TeamCreationPhase } from "@/core/components/phases/steps/TeamCreation";
import type { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import TeamCreationConfirmationPage from "@/core/pages/teams/TeamCreationConfirmationPage";
import TeamCreationQuestionnaire from "@/core/pages/teams/TeamCreationQuestionnaire";
import { useNotification } from "@/core/state/context/NotificationContext";
import type { TeamAttachment, TeamEntity, TeamExcludedFields, TeamIncludedFields, TeamK, TeamMeta } from '@/core/typings/entities/TeamEntity';

type ConcreteTeamData = TeamData<
  TeamEntity,
  TeamK,
  TeamMeta,
  TeamAttachment,
  TeamExcludedFields,
  TeamIncludedFields
>;


const TeamCreationPhaseManager: React.FC = () => {
  const { state } = useAuth();
  const { notify } = useNotification();
  const [currentPhase, setCurrentPhase] = useState<TeamCreationPhase>(
    TeamCreationPhase.QUESTIONNAIRE
  );

  const [teamData, setTeamData] = useState<ConcreteTeamData | null>(null);

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
      notify({
        id: `teamCreationSuccess_${teamData?._id || Date.now()}`,
        message: "Your team has been successfully created",
        data: {
          entityId: teamData?._id || 'unknown',
          entityType: 'team',
          extra: { 
            teamData,
            teamResponses,
            response: response.data
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    } catch (error: any) {
      // Handle any network or unexpected errors
      console.error("Error creating team:", error);
      
      notify({
        id: `teamCreationError_${Date.now()}`,
        message: "There was an error creating your team, please try again",
        data: {
          originalError: error.message || 'Unknown error',
          entityType: 'team',
          extra: { 
            teamData,
            teamResponses,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
  };

  const handleConfirmation = async (teamData: ConcreteTeamData) => {
    try {
      // Example: Send confirmation request to the server using Axios
      const response = await axiosInstance.post("/teams/confirm", teamData);

      await TeamCreationAPI.confirmTeamCreation(Number(teamData));

      // Handle the server response if needed
      console.log("Server response:", response.data);

      // Notify user of successful team confirmation
      notify({
        id: `teamConfirmationSuccess_${teamData.id || Date.now()}`,
        message: "Your team has been successfully confirmed",
        data: {
          entityId: teamData.id || 'unknown',
          entityType: 'team',
          extra: { 
            teamData,
            response: response.data
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });

      // Perform additional actions as needed, such as updating the UI or navigating to a different page
    } catch (error: any) {
      // Handle any network or unexpected errors
      console.error("Error confirming team creation:", error);
      
      notify({
        id: `teamConfirmationError_${teamData.id || Date.now()}`,
        message: "There was an error confirming your team, please try again",
        data: {
          originalError: error.message || 'Unknown error',
          entityId: teamData.id || 'unknown',
          entityType: 'team',
          extra: { 
            teamData,
            error 
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
  };

  const confirmTeamCreation = async (teamData: ConcreteTeamData) => {
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
