// TeamManagementService.ts
import { handleApiError } from "@/app/api/ApiLogs";
import {
    NotificationTypeEnum,
    useNotification,
} from "@/app/components/support/NotificationContext";
import { AxiosError } from "axios";
import { observable, runInAction } from "mobx";
import { useTeamContext } from "../components/context/TeamContext";
import { Team } from "../components/models/teams/Team";
import {
    markTaskAsComplete,
    markTodoAsComplete,
} from "../components/state/redux/slices/ApiSlice";
import { useTeamManagerStore } from "../components/state/stores/TeamStore";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { TeamActions } from "../components/teams/TeamActions";
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";
import { getEndpoint } from "./getEndpoint";

const API_BASE_URL = endpoints.teamManagement; // Update to the correct endpoint

const { notify } = useNotification();

export const teamManagementService = observable({

    fetchTeam: async (teamId: string): Promise<void> => {
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
            useTeamManagerStore().updateTeamData(teamData);
        } catch (error) { 
            handleApiError(error as AxiosError<unknown>, "Failed to fetch team");
            notify(
                "handleApiError",
                NOTIFICATION_MESSAGES.TeamManagement.FETCH_TEAM_ERROR,
                "Fetch Team Error",
                new Date(),
                NotificationTypeEnum.OperationError
            );
            throw error;
        }
    },
    
  fetchTeams: async (): Promise<void> => {
    try {
      const fetchTeamsEndpoint = getEndpoint("users.fetchTeams", endpoints); // Get the fetchTeams endpoint
      if (!fetchTeamsEndpoint) {
        console.error("Fetch teams endpoint not found.");
        return; // Exit the function if the endpoint is not found
      }

      const response = await axiosInstance.get(fetchTeamsEndpoint); // Make the request using the retrieved endpoint
      runInAction(() => {
        const fetchedTeams: Team[] = response.data;
        // Update state or perform other MobX-related actions using the manager
        useTeamManagerStore().fetchTeamsSuccess({ teams: fetchedTeams });
      });
    } catch (error) {
      if (error instanceof Error) {
        handleApiError(error as AxiosError<unknown>, "Failed to fetch teams");
        // Dispatch fetchTeamsFailure action with the error message
        useTeamManagerStore().fetchTeamsFailure({ error: error.message });
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
      runInAction(() => {
        const createdTeam: Team = response.data;
        // Update state or perform other MobX-related actions using the manager
        useTeamManagerStore().addTeamSuccess({ team: createdTeam });
      });
      notify(
        "Team Creation", // Content (can be empty in this case)
        "CreateTeamSuccessId", // Provide a unique ID for the notification
        NOTIFICATION_MESSAGES.Team.CREATE_TEAM_SUCCESS, // Message
        new Date(), // Date
        NotificationTypeEnum.OperationSuccess // Type
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        handleApiError(error as AxiosError<unknown>, "Failed to create team");
        notify(
          "CreateTeamErrorId", // Provide a unique ID for the notification
          "Team Create Error", // Content (can be empty in this case)
          NOTIFICATION_MESSAGES.Team.CREATE_TEAM_FAILURE, // Message
          new Date(), // Date
          NotificationTypeEnum.OperationError // Type
        );
        throw error;
      }
    }
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL.deleteTeam}/${teamId}`);
      notify(
        "DeleteTeamSuccessId", // Provide a unique ID for the notification
        "Team Deletion", // Content (can be empty in this case)
        NOTIFICATION_MESSAGES.Team.DELETE_TEAM_SUCCESS, // Message
        new Date(), // Date
        NotificationTypeEnum.OperationSuccess // Type
      );
      // Dispatch deleteTeamSuccess action if needed
    } catch (error) {
      if (error instanceof Error) {
        handleApiError(error as AxiosError<unknown>, "Failed to delete team");
        notify(
          "DeleteTeamErrorId", // Provide a unique ID for the notification
          error.message, // Example content: pass the error message
          NOTIFICATION_MESSAGES.Team.DELETE_TEAM_FAILURE, // Message
          new Date(), // Date
          NotificationTypeEnum.OperationError // Type
        );
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
      notify(
        "TeamManagement Data",
        "FetchTeammemberDataSuccessId",
        NOTIFICATION_MESSAGES.TeamManagement.FETCH_TEAMMEMBER_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
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
        notify(
          "FetchTeamManagementDataErrorId",
          error.message,
          NOTIFICATION_MESSAGES.TeamManagement.FETCH_TEAMMEMBER_FAILURE,
          new Date(),
          NotificationTypeEnum.OperationError
        );
        // Dispatch fetchApiDataFailure action with the error message
        TeamActions.fetchTeamsFailure({ error: error.message });
        throw error;
      }
    }
  },
});

export default teamManagementService;
