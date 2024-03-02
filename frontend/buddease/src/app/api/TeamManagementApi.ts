// TeamManagementService.ts
import { handleApiError } from '@/app/api/ApiLogs';
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import { observable, runInAction } from 'mobx';
import { useTeamContext } from '../components/context/TeamContext';
import { Team } from '../components/models/teams/Team';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.teamManagement; // Update to the correct endpoint

const { notify } = useNotification();

export const teamManagementService = observable({
    createTeam: async (teamData: any): Promise<any> => {
        try {
            const response = await axiosInstance.post(API_BASE_URL.createTeam, teamData);
            runInAction(() => {
                const createdTeam: Team = response.data;
                const { updateTeamData } = useTeamContext();
                // Update state or perform other MobX-related actions
                // Example: this.someStateVariable = response.data;
            });
            notify(
                "Team Creation", // Content (can be empty in this case)
                'CreateTeamSuccessId', // Provide a unique ID for the notification
                NOTIFICATION_MESSAGES.Team.CREATE_TEAM_SUCCESS, // Message
                new Date(), // Date
                NotificationTypeEnum.OperationSuccess // Type
            );
            // Dispatch createTeamSuccess action with the received data
            // ApiActions.createTeamSuccess({ data: response.data }); // Assuming you have this action
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                handleApiError(
                    error as AxiosError<unknown>,
                    'Failed to create team'
                );
                notify(
                    'CreateTeamErrorId', // Provide a unique ID for the notification
                    'Team Create Error', // Content (can be empty in this case)
                    NOTIFICATION_MESSAGES.Team.CREATE_TEAM_FAILURE, // Message
                    new Date(), // Date
                    NotificationTypeEnum.OperationError // Type
                );
                // Dispatch createTeamFailure action with the error message
                // ApiActions.createTeamFailure({ error: error.message }); // Assuming you have this action
                throw error;
            }
        }
    },

    deleteTeam: async (teamId: string): Promise<void> => {
        try {
            await axiosInstance.delete(`${API_BASE_URL.deleteTeam}/${teamId}`);
            notify(
                'DeleteTeamSuccessId', // Provide a unique ID for the notification
                "Team Deletion", // Content (can be empty in this case)
                NOTIFICATION_MESSAGES.Team.DELETE_TEAM_SUCCESS, // Message
                new Date(), // Date
                NotificationTypeEnum.OperationSuccess // Type
            );
            // Dispatch deleteTeamSuccess action if needed
        } catch (error) {
            if (error instanceof Error) {
                handleApiError(
                    error as AxiosError<unknown>,
                    'Failed to delete team'
                );
                notify(
                    'DeleteTeamErrorId', // Provide a unique ID for the notification
                    error.message, // Example content: pass the error message
                    NOTIFICATION_MESSAGES.Team.DELETE_TEAM_FAILURE, // Message
                    new Date(), // Date
                    NotificationTypeEnum.OperationError // Type
                )
            }
        }
    },

    fetchTeamMemberData: async (): Promise<any> => {
        try {
            const response = await axiosInstance.get(API_BASE_URL.fetchTeamMemberData);
            runInAction(() => {
                // Update state or perform other MobX-related actions
                // Example: this.someStateVariable = response.data;
            });
            notify(
                "TeamManagement Data",
                'FetchTeammemberDataSuccessId',
                NOTIFICATION_MESSAGES.TeamManagement.FETCH_TEAMMEMBER_SUCCESS,
                new Date(),
                NotificationTypeEnum.OperationSuccess
            );
            // Dispatch fetchApiDataSuccess action with the received data
            // TeamActions.fetchApiDataSuccess({ data: response.data });
            // Dispatch markTaskAsComplete action
            // markTaskAsComplete("taskId", "task");
            // Dispatch markTodoAsComplete action
            // markTodoAsComplete("todoId", "todo");
            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                handleApiError(
                    error as AxiosError<unknown>,
                    'Failed to fetch teamManagement data'
                );
                notify(
                    'FetchTeamManagementDataErrorId',
                    error.message,
                    NOTIFICATION_MESSAGES.TeamManagement.FETCH_TEAMMEMBER_FAILURE,
                    new Date(),
                    NotificationTypeEnum.OperationError
                );
                // Dispatch fetchApiDataFailure action with the error message
                // ApiActions.fetchApiDataFailure({ error: error.message });
                throw error;
            }
        }
    }
    // Add other methods for teamManagement-related API calls based on your requirements
});

export default teamManagementService
