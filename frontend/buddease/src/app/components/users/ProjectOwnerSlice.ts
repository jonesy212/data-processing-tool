// ProjectOwnerSlice.ts

import { getTeamMembersFromAPI } from "@/app/api/TeamApi";
import { ProjectDetails } from '@/app/components/projects/Project';
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Task } from "../models/tasks/Task";
import { Team } from "../models/teams/Team";
import { TeamMember } from "../models/teams/TeamMembers";
import UpdatedProjectDetails from "../projects/UpdateProjectDetails";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { RootState } from "../state/redux/slices/RootSlice";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { User } from "./User";

interface ProjectOwnerState {
  // Define the state structure here
  projectDetails: typeof ProjectDetails | null;
  teamMembers: TeamMember[] | null;
  tasks: Task[] | null;
  users: User[] | null;
  team: Team | null; 
}

const initialState: ProjectOwnerState = {
  // Initialize the state here
  projectDetails: null,
  teamMembers: null,
  tasks: null,
  users: null,
  team: null,

};

const { notify } = useNotification();
export const useProjectOwnerSlice = createSlice({
  name: "projectOwner",
  initialState,
  reducers: {
    updateProject: (state) => {
      try {
        state.projectDetails = UpdatedProjectDetails;

        notify(
          "Update Project Success",
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_ERROR,
          "Update Project Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    addTeamMember: (state, action: PayloadAction<TeamMember>) => {
      try {
        // Ensure teamMembers is initialized as an array if it's currently null
        if (state.teamMembers === null) {
          state.teamMembers = [];
        }
    
        // Push the new member to the array
        state.teamMembers.push(action.payload);
    
        // Notify success
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.ADD_TEAM_MEMBER_SUCCESS,
          "Add Team Member Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.ADD_TEAM_MEMBER_ERROR,
          "Add Team Member Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    

    removeTeamMember: (state, action: PayloadAction<any>) => {
      try {
        // Logic to remove a member from a project team
        const memberIdToRemove = action.payload.memberId;
        if (state.teamMembers) {
          state.teamMembers = state.teamMembers.filter(member => member.id !== memberIdToRemove);
        }
    
        // Notify success
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_SUCCESS,
          "Remove Team Member Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_ERROR,
          "Remove Team Member Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    
    assignTask: (state, action: PayloadAction<{ taskId: number; teamMemberId: number }>) => {
      // Synchronous logic for assigning a task
      try {
        const { taskId, teamMemberId } = action.payload;
    
        // Ensure state.tasks is not null before attempting to access it
        if (state.tasks) {
          state.tasks.forEach(task => {
            if (task.id === taskId) {
              // Ensure state.users is not null before attempting to access it
              if (state.users) {
                // Retrieve the corresponding user from state or another source
                const user: WritableDraft<User> | undefined = state.users.find(user => user.id === teamMemberId);
      
                if (user) {
                  // Assign the task to the specified team member
                  task.assignedTo = user;
                } else {
                  // Handle case where user is not found
                  throw new Error(`User with id ${teamMemberId} not found`);
                }
              } else {
                // Handle case where state.users is null
                throw new Error("Users array in state is null");
              }
            }
          });
        } else {
          // Handle case where state.tasks is null
          throw new Error("Tasks array in state is null");
        }
        // Notify success
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_SUCCESS,
          "Assign Task Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle error
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_ERROR,
          "Assign Task Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    
    createMeeting: (state, action: PayloadAction<any>) => {
      try {
        // Your synchronous logic here
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.CREATE_MEETING_SUCCESS,
          "Create Meeting Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle error
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.CREATE_MEETING_ERROR,
          "Create Meeting Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    updateMeeting: (state, action: PayloadAction<{ meetingId: number; updatedMeetingDetails: any }>) => {
      try {
        // Your synchronous logic here
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_SUCCESS,
          "Update Meeting Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle error
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_ERROR,
          "Update Meeting Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

  
    deleteMeeting: (state, action: PayloadAction<number>) => {
      // Synchronous logic for deleting a meeting
      try {
        // Your synchronous logic here
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_SUCCESS,
          "Delete Meeting Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle error
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_ERROR,
          "Delete Meeting Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    generateReport: (state) => {
      // Synchronous logic for generating a report
      try {
        // Logic to generate a report summarizing project progress and outcomes
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.GENERATE_REPORT_SUCCESS,
          "Generate Report Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.GENERATE_REPORT_ERROR,
          "Generate Report Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    exportData: (state) => {
      // Synchronous logic for exporting data
      try {
        // Logic to export project data for analysis or archival purposes

        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.EXPORT_DATA_SUCCESS,
          "Export Data Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.EXPORT_DATA_ERROR,
          "Export Data Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    getTeamMembers: (state) => {
      // Synchronous logic for fetching team members
      try {
        // Call API to fetch team members
        const teamMembers = getTeamMembersFromAPI(); // Assuming getTeamMembersFromAPI is a synchronous function
        // Handle the fetched data as needed
        // For example, update the state with the fetched team members

        // Example of updating state:
        // state.teamMembers = teamMembers;

        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.GET_TEAM_MEMBERS_SUCCESS,
          "Get Team Members Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.GET_TEAM_MEMBERS_ERROR,
          "Get Team Members Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      try {
        // Logic to update a task within a project

        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_TASK_SUCCESS,
          "Update Task Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_TASK_ERROR,
          "Update Task Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      try {
        // Logic to delete a task from a project

        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.DELETE_TASK_SUCCESS,
          "Delete Task Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          NOTIFICATION_MESSAGES.ProjectOwner.DELETE_TASK_ERROR,
          "Delete Task Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    // Add other actions as needed
  },
});

  // Export action creators
  export const {
    updateProject,
    addTeamMember,
    removeTeamMember,
    assignTask,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    generateReport,
    exportData,
    getTeamMembers,
    updateTask,
    deleteTask,


  // Development Services Actions
  hireDeveloper,
  compensateDeveloper,
  selectDeveloper,

  // Global Collaboration Features Actions
  initiateIdeationPhase,
  formTeam,
  brainstormProduct,
  launchProduct,
  performDataAnalysis,

  // Community Involvement Actions
  participateCommunity,
  promoteUnity,
  rewardContributions,

  // Monetization Opportunities Actions
  buildCustomApps,
  incentivizeProjectMetrics,
  contributeToSustainability,

  } = useProjectOwnerSlice.actions;

// Selectors
export const selectProjectOwner = (state: RootState) => state.projectOwner;

// Export the reducer
export default useProjectOwnerSlice.reducer;
