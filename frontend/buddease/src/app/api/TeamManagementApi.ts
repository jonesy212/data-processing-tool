// TeamManagementApi.ts
// TeamManagementService.ts
import { TeamActions } from "@/app/actions/TeamActions";
import { handleApiError } from "@/app/api/ApiLogs";
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import { useTeamContext } from "@/app/components/context/TeamContext";
import { Team } from "@/app/components/teams/Team";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/app/state/context/NotificationContext';
import {
  markTaskAsComplete,
  markTodoAsComplete,
} from "@/app/state/redux/slices/ApiSlice";
import { useTeamManagerStore } from "@/app/state/stores/TeamStore";
import { AxiosError } from "axios";
import { observable, runInAction } from "mobx";
import { getStoreId } from "./ApiData";
import { getEndpoint } from "./getEndpoint";

const API_BASE_URL = endpoints.teamManagement; // Update to the correct endpoint

const { notify } = useNotification();
const storeId = getStoreId(0)

export const teamManagementService = observable({

  fetchTeam: async (teamId: number): Promise<void> => {
    try {
      const fetchTeamEndpoint = getEndpoint("users.fetchTeam", endpoints); // Get the fetchTeam endpoint
      if (!fetchTeamEndpoint) {
        console.error("Fetch team endpoint not found.");
        return; // Exit the function if the endpoint is not found
      }

      // Adjust the fetch request to include the teamId parameter
      const response = await axiosInstance.get(`${fetchTeamEndpoint}/${teamId}`);

      // Process the response and update state or perform other actions as needed
      // For example:
      const teamData = response.data;
      (await useTeamManagerStore(Number(storeId))).updateTeamData(teamId, teamData);
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, "Failed to fetch team");
      useNotification().notify({
        id: "fetchTeamError",
        message: NOTIFICATION_MESSAGES.TeamManagement.FETCH_TEAM_ERROR,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to fetch team",
            teamId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  fetchTeams: async (teamIds: number[]): Promise<void> => {
    try {
      const fetchTeamsEndpoint = getEndpoint("users.fetchTeams", endpoints);
      if (!fetchTeamsEndpoint) {
        console.error("Fetch teams endpoint not found.");
        return; // Exit the function if the endpoint is not found
      }

      const response = await axiosInstance.get(fetchTeamsEndpoint); // Make the request using the retrieved endpoint
      const fetchedTeams: Team[] = response.data; // Assume response contains an array of Team objects

      runInAction(async () => {
        const teamId = teamIds[0];

        // Find the team with the matching teamId
        const matchingTeam = fetchedTeams.find((team) => Number(team.id) === teamId);

        if (!matchingTeam) {
          console.error("No matching team found for the given teamId.");
          return;
        }

        // Use the found team with the getTeamId method
        const fetchedTeamId = await (await useTeamManagerStore(Number(storeId)))
          .getTeamId(String(teamId), matchingTeam);

        // Update state or perform other MobX-related actions using the manager
        if (teamId !== teamIds[0]) {
          (await useTeamManagerStore(fetchedTeamId)).fetchTeamsSuccess({ teams: fetchedTeams });
        } else {
          (await useTeamManagerStore(Number(storeId))).fetchTeamsSuccess({ teams: fetchedTeams });
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        handleApiError(error as AxiosError<unknown>, "Failed to fetch teams");
        (await useTeamManagerStore(Number(storeId))).fetchTeamsFailure({ error: error.message });
        throw error;
      }
    }
  },
  
  createTeam: async (teamData: any): Promise<any> => {
    try {
      const createTeamEndpoint = getEndpoint("users.createTeam", endpoints); // Get the createTeam endpoint
      if (!createTeamEndpoint) {
        console.error("Create team endpoint not found.");
        return; // Exit the function if the endpoint is not found
      }
      const response = await axiosInstance.post(createTeamEndpoint, teamData); // Make the request using the retrieved endpoint URL
      runInAction(async () => {
        const createdTeam: Team = response.data;
        // Update state or perform other MobX-related actions using the manager
        (await useTeamManagerStore(Number(storeId))).addTeamSuccess({ team: createdTeam });
      });

      useNotification().notify({
        id: "createTeamSuccess",
        message: NOTIFICATION_MESSAGES.Team.CREATE_TEAM_SUCCESS,
        data: {
          extra: {
            operation: "Create team",
            teamData: teamData
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        handleApiError(error as AxiosError<unknown>, "Failed to create team");

        useNotification().notify({
          id: "createTeamError",
          message: NOTIFICATION_MESSAGES.Team.CREATE_TEAM_FAILURE,
          data: {
            originalError: error.message,
            extra: {
              errorMessage: "Failed to create team",
              teamData: teamData
            }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: 'error'
        });

        throw error;
      }
    }
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL.deleteTeam}/${teamId}`);

      useNotification().notify({
        id: "deleteTeamSuccess",
        message: NOTIFICATION_MESSAGES.Team.DELETE_TEAM_SUCCESS,
        data: {
          extra: {
            teamId: teamId,
            operation: "Delete team"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });

      // Dispatch deleteTeamSuccess action if needed
    } catch (error) {
      if (error instanceof Error) {
        handleApiError(error as AxiosError<unknown>, "Failed to delete team");

        useNotification().notify({
          id: "deleteTeamError",
          message: NOTIFICATION_MESSAGES.Team.DELETE_TEAM_FAILURE,
          data: {
            originalError: error.message,
            extra: {
              errorMessage: "Failed to delete team",
              teamId: teamId
            }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: 'error'
        });
      }
    }
  },

  fetchTeamMemberData: async (): Promise<any> => {
    try {
      const { teamData, updateTeamData } = useTeamContext(); // Assuming you have a data object in your team context

      const fetchTeamMemberDataEndpoint = getEndpoint(
        "fetchTeamMemberData",
        API_BASE_URL
      );
      if (
        !fetchTeamMemberDataEndpoint ||
        typeof fetchTeamMemberDataEndpoint !== "string"
      ) {
        console.error("Fetch team member data endpoint not found or invalid.");
        return;
      }

      const response = await axiosInstance.get(fetchTeamMemberDataEndpoint);
      runInAction(() => {
        // Update state or perform other MobX-related actions
        updateTeamData(response.data); // Update team data with the fetched response
      });

      useNotification().notify({
        id: "fetchTeamMemberDataSuccess",
        message: NOTIFICATION_MESSAGES.TeamManagement.FETCH_TEAMMEMBER_SUCCESS,
        data: {
          extra: {
            operation: "Fetch team member data",
            dataCount: Array.isArray(response.data) ? response.data.length : 'single'
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });

      // Dispatch fetchApiDataSuccess action with the received data
      TeamActions.fetchApiDataSuccess({ data: response.data });
      // Dispatch markTaskAsComplete action
      markTaskAsComplete("taskId", "task");
      // Dispatch markTodoAsComplete action
      markTodoAsComplete("todoId", "todo");

      // Now you can use teamData here if needed
      console.log("Team data:", teamData);

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        handleApiError(
          error as AxiosError<unknown>,
          "Failed to fetch teamManagement data"
        );

        useNotification().notify({
          id: "fetchTeamMemberDataError",
          message: NOTIFICATION_MESSAGES.TeamManagement.FETCH_TEAMMEMBER_FAILURE,
          data: {
            originalError: error.message,
            extra: {
              errorMessage: "Failed to fetch team member data"
            }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: 'error'
        });

        // Dispatch fetchApiDataFailure action with the error message
        TeamActions.fetchTeamsFailure({ error: error.message });
        throw error;
      }
    }
  },
});

export default teamManagementService;
