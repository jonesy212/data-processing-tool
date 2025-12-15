// TeamCreationManager.tsx
import axiosInstance from "@/app/api/csrfToken";
import React, { useState } from "react";
import { AxiosError } from 'axios';
import * as TeamAPI from "@/app/api/ApiTeam";
import { NotificationTypeEnum } from "@/app/features/support/UnifiedNotificationTypes";
import TeamCreationConfirmationPage from "@/app/pages/teams/TeamCreationConfirmationPage";
import { useNotification } from "@/app/state/context/NotificationContext";
import TeamBasicInfoStep from "./TeamBasicInfoStep";
import TeamMembersStep from "./TeamMembersStep";
import TeamPreferencesStep from "./TeamPreferencesStep";
import TeamReviewStep from "./TeamReviewStep";
import TeamSummaryStep from "./TeamSummaryStep";

export enum TeamCreationPhase {
  BASIC_INFO = "BASIC_INFO",
  MEMBERS = "MEMBERS",
  PREFERENCES = "PREFERENCES",
  REVIEW = "REVIEW",
  QUESTIONNAIRE = "QUESTIONNAIRE",
  SUMMARY = "SUMMARY",
  CONFIRMATION = "CONFIRMATION",
}

const TeamCreationProcess: React.FC = () => {
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

      // Success notification using object format
      const { notify } = useNotification();
      notify({
        id: `team_creation_success_${teamData._id}_${Date.now()}`,
        message: "Team has been successfully created",
        data: {
          entityType: "team",
          entityId: teamData._id || "new",
          action: "create",
          teamData: teamData,
          responseData: response.data,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: "success" as const,
        metadata: {
          operation: "team_creation",
          step: "review_submit",
          teamSize: teamData.members?.length || 0,
        },
      });
    } catch (error: any) {
      console.error("Error creating team:", error);

      // Enhanced error notification
      const { notify } = useNotification();
      const axiosError = error as AxiosError;
      let userMessage = "Error creating team";
      let errorType = "TEAM_CREATION_ERROR";

      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 400:
            userMessage = "Invalid team data provided";
            break;
          case 401:
            userMessage = "Authentication required to create team";
            break;
          case 403:
            userMessage = "You don't have permission to create teams";
            break;
          case 409:
            userMessage = "Team already exists";
            break;
          case 422:
            userMessage = "Team validation failed";
            break;
          case 500:
            userMessage = "Server error while creating team";
            break;
        }
      } else if (axiosError.request) {
        userMessage =
          "Network error: Unable to connect to team creation service";
        errorType = "TEAM_CREATION_NETWORK_ERROR";
      }

      // Using consistent object format
      notify({
        id: `team_creation_error_${teamData._id}_${Date.now()}`,
        message: userMessage,
        data: {
          entityType: "team",
          entityId: teamData._id || "new",
          action: "create",
          teamData: teamData,
          originalError: axiosError.message,
          statusCode: axiosError.response?.status,
          errorType: errorType,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: "error" as const,
        metadata: {
          operation: "team_creation",
          isRetryable: ![400, 401, 403, 409].includes(
            axiosError.response?.status || 0
          ),
          requiresManualReview: [403, 409].includes(
            axiosError.response?.status || 0
          ),
        },
      });
    }
  };
  const handleConfirmation = async (teamData: any) => {
    try {
      const response = await TeamAPI.confirmTeamCreation(teamData);
      console.log("Server response:", response);

      // Success notification using object format
      const { notify } = useNotification();
      notify({
        id: `team_confirmation_success_${teamData._id}_${Date.now()}`,
        message: "Your team has been successfully confirmed",
        data: {
          entityType: "team",
          entityId: teamData._id || "unknown",
          action: "confirm",
          extra: {
            teamData: teamData,
            responseData: response,
            teamDetails: {
              name: teamData.name,
              memberCount: teamData.members?.length || 0,
              projectCount: teamData.projects?.length || 0,
            },
            timestamp: new Date().toISOString(),
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: "success" as const,
        metadata: {
          operation: "team_confirmation",
          confirmationType: "team_creation",
          teamId: teamData._id,
        },
      });
    } catch (error: any) {
      console.error("Error confirming team creation:", error);

      // Enhanced error notification for team confirmation
      const { notify } = useNotification();
      const axiosError = error as AxiosError;
      let userMessage = "There was an error confirming your team";
      let errorType = "TEAM_CONFIRMATION_ERROR";
      let canRetry = true;

      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 400:
            userMessage = "Invalid team confirmation data";
            errorType = "TEAM_CONFIRMATION_VALIDATION_ERROR";
            break;
          case 401:
            userMessage = "Authentication required to confirm team";
            errorType = "TEAM_CONFIRMATION_AUTH_ERROR";
            canRetry = true;
            break;
          case 403:
            userMessage = "You don't have permission to confirm this team";
            errorType = "TEAM_CONFIRMATION_PERMISSION_ERROR";
            canRetry = false;
            break;
          case 404:
            userMessage = "Team not found for confirmation";
            errorType = "TEAM_NOT_FOUND_ERROR";
            canRetry = false;
            break;
          case 409:
            userMessage = "Team confirmation conflict";
            errorType = "TEAM_CONFIRMATION_CONFLICT_ERROR";
            canRetry = false;
            break;
          case 410:
            userMessage = "Team confirmation expired";
            errorType = "TEAM_CONFIRMATION_EXPIRED_ERROR";
            canRetry = false;
            break;
          case 422:
            userMessage = "Team confirmation validation failed";
            errorType = "TEAM_CONFIRMATION_VALIDATION_ERROR";
            break;
          case 429:
            userMessage = "Too many confirmation attempts - please wait";
            errorType = "TEAM_CONFIRMATION_RATE_LIMIT_ERROR";
            canRetry = true;
            break;
          case 500:
            userMessage = "Server error while confirming team";
            errorType = "TEAM_CONFIRMATION_SERVER_ERROR";
            canRetry = true;
            break;
        }
      } else if (axiosError.request) {
        userMessage = "Network error: Unable to confirm team";
        errorType = "TEAM_CONFIRMATION_NETWORK_ERROR";
      }

      // Error notification using object format
      notify({
        id: `team_confirmation_error_${teamData._id}_${Date.now()}`,
        message: userMessage,
        data: {
          entityType: "team",
          entityId: teamData._id || "unknown",
          action: "confirm",
          originalError: axiosError.message,
          extra: {
            teamData: teamData,
            statusCode: axiosError.response?.status,
            errorType: errorType,
            errorData: axiosError.response?.data,
            teamDetails: {
              name: teamData.name,
              memberCount: teamData.members?.length || 0,
            },
            timestamp: new Date().toISOString(),
          },
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: "error" as const,
        metadata: {
          operation: "team_confirmation",
          errorCategory: errorType,
          canRetry: canRetry,
          requiresManualAction: !canRetry,
        },
      });

      // Provide retry guidance if applicable
      if (canRetry) {
        setTimeout(() => {
          notify({
            id: `team_retry_suggestion_${teamData._id}_${Date.now()}`,
            message: "You can try confirming this team again",
            data: {
              entityType: "team",
              entityId: teamData._id,
              action: "retry_suggestion",
              extra: {
                suggestionType: "retry",
                originalErrorType: errorType,
                retryDelay: "2 seconds",
                timestamp: new Date().toISOString(),
              },
            },
            timestamp: new Date(),
            type: NotificationTypeEnum.INFO,
            level: "info" as const,
            action: {
              label: "Retry Now",
              onClick: () => handleConfirmation(teamData),
            },
          });
        }, 2000);
      } else {
        // For non-retryable errors, suggest alternative action
        notify({
          id: `team_alternative_action_${teamData._id}_${Date.now()}`,
          message:
            "This team cannot be confirmed. Please contact support or create a new team.",
          data: {
            entityType: "team",
            entityId: teamData._id,
            action: "alternative_action_suggestion",
            extra: {
              suggestionType: "alternative_action",
              reason: errorType,
              originalError: userMessage,
              timestamp: new Date().toISOString(),
            },
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.WARNING,
          level: "warning" as const,
          action: {
            label: "Contact Support",
            onClick: () => window.open("/support", "_blank"),
          },
        });
      }
    }
  };

  // Helper function for retry logic
  const shouldRetryTeamConfirmation = (statusCode?: number): boolean => {
    const retryableStatuses = [401, 429, 500, 502, 503, 504];
    const nonRetryableStatuses = [403, 404, 409, 410];

    if (!statusCode) return true; // Network errors are usually retryable

    if (nonRetryableStatuses.includes(statusCode)) return false;
    if (retryableStatuses.includes(statusCode)) return true;

    // Default for unknown status codes
    return statusCode >= 500; // Retry server errors, not client errors
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
      {currentStep === TeamCreationPhase.SUMMARY && (
        <TeamSummaryStep teamData={teamData} />
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

export default TeamCreationProcess;
