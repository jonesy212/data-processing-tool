import axiosInstance from "@/app/api/axiosInstance";
import { NotificationType, useNotification } from "@/app/context/NotificationContext";
import { AxiosError, AxiosResponse } from "axios";
import { useParams } from "react-router-dom";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import headersConfig from "./headers/HeadersConfig";
import { endpoints } from "@/app/api/endpointConfigurations";

// Define the API base URL
const API_BASE_URL = endpointCs.teams;

// Define API notification messages
interface TeamNotificationMessages {
  FETCH_TEAMS_SUCCESS: string;
  FETCH_TEAMS_ERROR: string;
  ADD_TEAM_SUCCESS: string;
  ADD_TEAM_ERROR: string;
  REMOVE_TEAM_SUCCESS: string;
  REMOVE_TEAM_ERROR: string;
  UPDATE_TEAM_SUCCESS: string;
  UPDATE_TEAM_ERROR: string;
  FETCH_TEAM_MEMBERS_SUCCESS: string;
  FETCH_TEAM_MEMBERS_ERROR: string;
  FETCH_TEAM_DATA_SUCCESS: string;
  FETCH_TEAM_DATA_ERROR: string;
  // Add more keys as needed
}

const teamNotificationMessages: TeamNotificationMessages = {
  FETCH_TEAMS_SUCCESS: NOTIFICATION_MESSAGES.Team.FETCH_TEAMS_SUCCESS,
  FETCH_TEAMS_ERROR: NOTIFICATION_MESSAGES.Team.FETCH_TEAMS_ERROR,
  ADD_TEAM_SUCCESS: NOTIFICATION_MESSAGES.Team.ADD_TEAM_SUCCESS,
  ADD_TEAM_ERROR: NOTIFICATION_MESSAGES.Team.ADD_TEAM_ERROR,
  REMOVE_TEAM_SUCCESS: NOTIFICATION_MESSAGES.Team.REMOVE_TEAM_SUCCESS,
  REMOVE_TEAM_ERROR: NOTIFICATION_MESSAGES.Team.REMOVE_TEAM_ERROR,
  UPDATE_TEAM_SUCCESS: NOTIFICATION_MESSAGES.Team.UPDATE_TEAM_SUCCESS,
  UPDATE_TEAM_ERROR: NOTIFICATION_MESSAGES.Team.UPDATE_TEAM_ERROR,
  FETCH_TEAM_MEMBERS_SUCCESS: NOTIFICATION_MESSAGES.Team.FETCH_TEAM_MEMBERS_SUCCESS,
  FETCH_TEAM_MEMBERS_ERROR: NOTIFICATION_MESSAGES.Team.FETCH_TEAM_MEMBERS_ERROR,
  FETCH_TEAM_DATA_SUCCESS: NOTIFICATION_MESSAGES.Team.FETCH_TEAM_DATA_SUCCESS,
  FETCH_TEAM_DATA_ERROR: NOTIFICATION_MESSAGES.Team.FETCH_TEAM_DATA_ERROR,
  // Add more properties as needed
};



const {teamId} = useParams()
class TeamApiService {
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;

  constructor(
    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: NotificationType
    ) => void
  ) {
    this.notify = notify;
  }

  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    errorMessage: string,
    successMessageId: keyof TeamNotificationMessages, // Use keyof TeamNotificationMessages
    errorMessageId: keyof TeamNotificationMessages, // Use keyof TeamNotificationMessages  
    notificationData: any = null
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();

      // Manage headers in response
      if (response.headers) {
        headersConfig["Authorization"] = response.headers["authorization"];
      }

      if (successMessageId) {
        const successMessage = teamNotificationMessages[successMessageId];
        this.notify(
          successMessageId,
          successMessage,
          notificationData,
          new Date(),
          "TeamSuccess" as NotificationType
        );
      }

      return response;
    } catch (error: any) {
      handleApiError(error as AxiosError<unknown, any>, errorMessage);

      if (errorMessageId) {
        const errorMessage = teamNotificationMessages[errorMessageId];
        this.notify(
          errorMessageId,
          errorMessage,
          notificationData,
          new Date(),
          "TeamError" as NotificationType
        );
      }
      throw error;
    }
  }

  async fetchTeams(): Promise<AxiosResponse> {
    const endpoint = endpointConfigurations.teams.list;
    return await this.requestHandler(
      () => axiosInstance.get(endpoint.path),
      "Failed to fetch teams",
      "FETCH_TEAMS_SUCCESS",
      "FETCH_TEAMS_ERROR"
    );
  }

  async getTeamById(teamId: number): Promise<AxiosResponse> {
    const endpoint = endpointConfigurations.teams.single(teamId);
    return await this.requestHandler(
      () => axiosInstance.get(endpoint.path),
      "Failed to fetch team by ID",
      "FETCH_TEAM_DATA_SUCCESS",
      "FETCH_TEAM_DATA_ERROR"
    );
  }

  async addTeam(newTeam: any): Promise<AxiosResponse> {
    const endpoint = endpointConfigurations.teams.add;
    return await this.requestHandler(
      () => axiosInstance.post(endpoint.path, newTeam),
      "Failed to add team",
      "ADD_TEAM_SUCCESS",
      "ADD_TEAM_ERROR"
    );
  }

  async removeTeam(teamId: number): Promise<AxiosResponse> {
    const endpoint = endpointConfigurations.teams.remove(teamId);
    return await this.requestHandler(
      () => axiosInstance.delete(endpoint.path),
      "Failed to remove team",
      "REMOVE_TEAM_SUCCESS",
      "REMOVE_TEAM_ERROR"
    );
  }

  async updateTeam(teamId: number, updatedTeam: any): Promise<AxiosResponse> {
    const endpoint = endpointConfigurations.teams.update(teamId);
    return await this.requestHandler(
      () => axiosInstance.put(endpoint.path, updatedTeam),
      "Failed to update team",
      "UPDATE_TEAM_SUCCESS",
      "UPDATE_TEAM_ERROR"
    );
  }

  async fetchTeamMembers(teamId: number): Promise<AxiosResponse> {
    const endpoint = endpointConfigurations.teams.single(teamId);
    return await this.requestHandler(
      () => axiosInstance.get(`${endpoint.path}/members`),
      "Failed to fetch team members",
      "FETCH_TEAM_MEMBERS_SUCCESS",
      "FETCH_TEAM_MEMBERS_ERROR"
    );
  }

  async fetchTeamData(teamId: number): Promise<AxiosResponse> {
    const endpoint = endpointConfigurations.teams.fetchTeamData(teamId);
    return await this.requestHandler(
      () => axiosInstance.get(endpoint.path),
      "Failed to fetch team data",
      "FETCH_TEAM_DATA_SUCCESS",
      "FETCH_TEAM_DATA_ERROR"
    );
  }

  async assignNoteToTeam(teamId: number, noteId: string): Promise<AxiosResponse> {
    const endpoint = endpointConfigurations.teams.single(teamId);
    return await this.requestHandler(
      () => axiosInstance.post(`${endpoint.path}/notes/${noteId}`),
      "Failed to assign note to team",
      "FETCH_TEAM_DATA_SUCCESS",
      "FETCH_TEAM_DATA_ERROR"
    );
  }
  // Additional team API methods can be added here...
}

// Export the TeamApiService instance
const teamApiService = new TeamApiService(useNotification);
export default teamApiService;
