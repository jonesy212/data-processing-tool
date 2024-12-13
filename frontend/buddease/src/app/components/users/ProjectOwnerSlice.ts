// ProjectOwnerSlice.ts
import { ProjectDetails } from "@/app/components/projects/Project";
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { DeveloperPersona } from "@/app/pages/personas/DeveloperPersona";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Meeting } from "../communications/scheduler/Meeting";
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

  projectDetails: ProjectDetails | null;
  teamMembers: TeamMember[] | null;
  tasks: Task[] | null;
  users: User[] | null;
  team: Team | null;
  meetings: Meeting[] | null;
  developers: DeveloperPersona[];
  compensation: string;
  selectedDeveloper: string;
  productLaunched: boolean;
  dataAnalysisPerformed: boolean;
  unityPromoted: boolean;
  communityParticipation: boolean;
  contributionsRewarded: boolean;
  customAppsBuilt: number;
  projectMetricsIncentivized: boolean;
  sustainabilityContributed: boolean;
}

const initialState: ProjectOwnerState = {
  // Initialize the state here
  projectDetails: null,
  teamMembers: null,
  tasks: null,
  users: null,
  team: null,
  meetings: null,
  developers: [],
  compensation: "",
  selectedDeveloper: "",
  productLaunched: false,
  dataAnalysisPerformed: false,
  unityPromoted: false,
  communityParticipation: false,
  contributionsRewarded: false,
  customAppsBuilt: 0,
  projectMetricsIncentivized: false,
  sustainabilityContributed: false,
};

const generateReport = (
  state: ProjectOwnerState,
  payload: any,
  customSections?: string[] // Optional parameter for custom sections
) => {
  // Define default content sections
  const defaultSections = {
    projectDetails: state.projectDetails,
    teamMembers: state.teamMembers,
    tasks: state.tasks,
    users: state.users,
    team: state.team,
    meetings: state.meetings,
    // Add more default sections as needed
  };

  // Initialize report object with default sections
  let report: any = { ...defaultSections };

  // Include custom sections if provided
  if (customSections && customSections.length > 0) {
    customSections.forEach((section) => {
      // Check if the custom section exists in the state
      if (section in state) {
        report[section] = state[section as keyof ProjectOwnerState];
      } else {
        // Handle invalid custom section names
        console.warn(
          `Custom section '${section}' does not exist in the state.`
        );
      }
    });
  }

  // Include payload content if available
  if (payload && payload.content) {
    report.content = payload.content;
  }

  // Add more customization options as needed

  return report;
};

export const generateReportAsync = createAsyncThunk(
  "projectOwner/generateReport",
  async (payload: any, { getState }) => {
    try {
      // Access state
      const currentState = getState() as ProjectOwnerState;

      // Add your logic to generate the report using state and payload data
      // Example:
      const report = generateReport(currentState, payload);

      // Return the generated report
      return report;
    } catch (error) {
      // Handle errors
      console.error("Error generating report:", error);
      // You can throw the error here if necessary, or handle it accordingly
      throw error;
    }
  }
);

// Create an asynchronous thunk action creator named exportData
export const exportData = createAsyncThunk(
  // Specify the action type string
  "projectOwner/exportData",
  // Define the asynchronous function that handles exporting data
  async (payload: any, { getState }) => {
    try {
      // Access the current state using getState
      const currentState = getState() as ProjectOwnerState;

      // Implement exportData logic here
      // For this example, let's assume we have tasks in the state that need to be exported
      const tasksToExport = currentState.tasks;

      // Simulate some asynchronous operation (e.g., fetching data from a server)
      // In a real-world scenario, this might involve making an HTTP request
      // For demonstration purposes, we'll use a setTimeout function to mimic an asynchronous operation
      const exportedData = await new Promise<any>((resolve) => {
        setTimeout(() => {
          // Once the data is fetched or processed, resolve the promise with the exported data
          resolve(tasksToExport);
        }, 2000); // Simulating a delay of 2 seconds
      });

      // Return the data to be exported as the fulfilled action payload
      return exportedData;
    } catch (error) {
      // Handle errors
      console.error("Error exporting data:", error);
      // You can throw the error here if necessary, or handle it accordingly
      throw error;
    }
  }
);

const { notify } = useNotification();
export const useProjectOwnerSlice = createSlice({
  name: "projectOwner",
  initialState,
  reducers: {
    updateProject: (state, action: PayloadAction<WritableDraft<ProjectDetails>>) => {
      try {
        state.projectDetails = action.payload;

        notify(
          "updateProjectSuccess",
          "Update Project Success",
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          "updateProjectError",
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_ERROR,
          "Update Project Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    addTeamMember: (state, action: PayloadAction<WritableDraft<TeamMember>>) => {
      try {
        // Ensure teamMembers is initialized as an array if it's currently null
        if (state.teamMembers === null) {
          state.teamMembers = [];
        }

        // Push the new member to the array
        state.teamMembers.push(action.payload);

        // Notify success
        notify(
          "addTeamMemberSuccess",
          "Add Team Member Success",
          NOTIFICATION_MESSAGES.ProjectOwner.ADD_TEAM_MEMBER_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          "addTeamMemberError",
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
          state.teamMembers = state.teamMembers.filter(
            (member) => member.id !== memberIdToRemove
          );
        }

        // Notify success
        notify(
          "removeTeamMemberSuccess",
          NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_SUCCESS,
          "Remove Team Member Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        notify(
          "",
          NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_ERROR,
          "Remove Team Member Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    assignTask: (
      state,
      action: PayloadAction<{ taskId: number; teamMemberId: number }>
    ) => {
      // Synchronous logic for assigning a task
      try {
        const { taskId, teamMemberId } = action.payload;

        // Ensure state.tasks is not null before attempting to access it
        if (state.tasks) {
          state.tasks.forEach((task) => {
            if (task.id === String(taskId)) {
              // Ensure state.users is not null before attempting to access it
              if (state.users) {
                // Retrieve the corresponding user from state or another source
                const user: WritableDraft<User> | undefined = state.users.find(
                  (user) => user.id === teamMemberId
                );

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
          "assignTaskSuccess",
          NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_SUCCESS,
          "Assign Task Success",
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle error
        notify(
          "assignTaskError",
          NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_ERROR,
          "Assign Task Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    createMeeting: (state, action: PayloadAction<any>) => {
      try {
        // Extract any necessary data from the action payload
        const meetingData = action.payload;

        // Your synchronous logic here, for example, updating state or performing other operations

        // Example of updating state:
        // state.meetings.push(meetingData);

        // Handle error
        notify(
          "createMeetingError",
          NOTIFICATION_MESSAGES.ProjectOwner.CREATE_MEETING_ERROR,
          "Create Meeting Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      } catch (error) {}
    },

    updateMeeting: (state, action: PayloadAction<any>) => {
      try {
        // Extract meeting data from action payload
        const meetingId = action.payload.id;
        // Find meeting in state by id and update
        state.meetings?.forEach((meeting) => {
          if (meeting.id === meetingId) {
            meeting.title = action.payload.title;
            meeting.description = action.payload.description;
            meeting.date = action.payload.date;
          }
        });

        // Handle error
        notify(
          "updateMeetingError",
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_ERROR,
          "Update Meeting Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      } catch (e) {
        // Handle error
        notify(
          "updateMeetingError",
          "Update Meeting Error",
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETIN_ERROR,
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    deleteMeeting: (state, action: PayloadAction<any>) => {
      try {
        // Extract meeting id from action payload
        const id = action.payload;

        // Check if state.meetings is not null or undefined
        if (state.meetings !== null && state.meetings !== undefined) {
          // Filter meetings array to remove meeting with id
          state.meetings = state.meetings.filter(
            (meeting) => meeting.id !== id
          );
        }
        // Handle success
        notify(
          "deleteMeetingSuccess",
          "Delete Meeting Success",
          NOTIFICATION_MESSAGES.Project.DELETE_MEETING_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle error
        notify(
          "deleteMeetingError",
          NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_ERROR,
          "Delete Meeting Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    getTeamMembers: (state, action: PayloadAction<any>) => {
      try {
        // Extract team members from state
        const teamMembers = state;
      } catch (error) {
        // Handle error
        notify(
          "getTeamMembersError",
          "Get Team Members Error",
          NOTIFICATION_MESSAGES.ProjectOwner.GET_TEAM_MEMBERS_ERROR,
          new Date(),
          NotificationTypeEnum.OperationError
        );
        // Return team members
      }
    },

    generateReport: (
      state,
      action: PayloadAction<{ reportData: any; customSections?: string[] }>
    ) => {
      try {
        // Extract necessary data from the action payload
        const { reportData, customSections } = action.payload;

        // Generate report using reportData and customSections
        const report = generateReport(
          JSON.parse(JSON.stringify(state)) as ProjectOwnerState, // Convert to an immutable object
          reportData,
          customSections
        );
        
        // Handle success (if needed)
        notify(
          "generateReportSuccess",
          "Generate Report Success",
          NOTIFICATION_MESSAGES.ProjectOwner.GENERATE_REPORT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );

        // Optionally return the generated report (if needed)
        return report;
      } catch (error) {
        // Handle error
        console.error("Error generating report:", error);
        notify(
          "generateReportError",
          NOTIFICATION_MESSAGES.ProjectOwner.GENERATE_REPORT_ERROR,
          "Generate Report Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
        // Return undefined or some default value in case of error
        return undefined;
      }
    },
    updateTask: (
      state,
      action: PayloadAction<{ taskId: string; updatedTask: Task }>
    ) => {
      try {
        const { taskId, updatedTask } = action.payload;

        // Find the task by taskId and update it
        const taskToUpdate = state.tasks?.find((task) => task.id === taskId);
        if (taskToUpdate) {
          Object.assign(taskToUpdate, updatedTask);
          notify(
            "updateTaskSuccess",
            "Update Task Success",
            NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_TASK_SUCCESS,
            new Date(),
            NotificationTypeEnum.OperationSuccess
          );
        } else {
          // Handle case where task is not found
          notify(
            "updateTaskError",
            NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_TASK_ERROR,
            "Update Task Error: Task not found",
            new Date(),
            NotificationTypeEnum.OperationError
          );
        }
      } catch (error) {
        // Handle errors
        console.error("Error updating task:", error);
        notify(
          "updateTaskError",
          NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_TASK_ERROR,
          "Update Task Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      try {
        const taskIdToDelete = action.payload;

        // Check if state.tasks is not null or undefined
        if (state.tasks !== null && state.tasks !== undefined) {
          // Remove the task with taskIdToDelete
          state.tasks = state.tasks.filter(
            (task) => task.id !== taskIdToDelete
          );

          notify(
            "deleteTaskSuccess",
            "Delete Task Success",
            NOTIFICATION_MESSAGES.ProjectOwner.DELETE_TASK_SUCCESS,
            new Date(),
            NotificationTypeEnum.OperationSuccess
          );
        } else {
          // Handle case where state.tasks is null or undefined
          console.error(
            "Error deleting task: state.tasks is null or undefined"
          );
          notify(
            "deleteTaskError",
            NOTIFICATION_MESSAGES.ProjectOwner.DELETE_TASK_ERROR,
            "Delete Task Error: state.tasks is null or undefined",
            new Date(),
            NotificationTypeEnum.OperationError
          );
        }
      } catch (error) {
        // Handle other errors
        console.error("Error deleting task:", error);
        notify(
          "deleteTaskError",
          NOTIFICATION_MESSAGES.ProjectOwner.DELETE_TASK_ERROR,
          "Delete Task Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    hireDeveloper: (state, action: PayloadAction<DeveloperPersona>) => {
      try {
        const developerId = action.payload;
        // Add logic to hire the developer
        state.developers.push(developerId);

        notify(
          "hireDeveloperSuccess",
          "Hire Developer Success",
          NOTIFICATION_MESSAGES.ProjectOwner.HIRE_DEVELOPER_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error hiring developer:", error);
        notify(
          "hireDeveloperError",
          NOTIFICATION_MESSAGES.ProjectOwner.HIRE_DEVELOPER_ERROR,
          "Hire Developer Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    compensateDeveloper: (
      state,
      action: PayloadAction<{ developerId: string; amount: number }>
    ) => {
      try {
        const { developerId, amount } = action.payload;
        // Find the developer in the state and update compensation
        const developer = state.developers.find(
          (dev) => dev.id === developerId
        );
        if (developer) {
          developer.compensation += amount;
        }

        notify(
          "compensateDeveloperSuccess",
          "Compensate Developer Success",
          NOTIFICATION_MESSAGES.ProjectOwner.COMPENSATE_DEVELOPER_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error compensating developer:", error);
        notify(
          "compensateDeveloperError",
          NOTIFICATION_MESSAGES.ProjectOwner.COMPENSATE_DEVELOPER_ERROR,
          "Compensate Developer Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    selectDeveloper: (state, action: PayloadAction<string>) => {
      try {
        const selectedDeveloperId = action.payload;

        // select the developer

        state.selectedDeveloper = selectedDeveloperId;

        notify(
          "selectDeveloperSuccess",
          "Select Developer Success",
          NOTIFICATION_MESSAGES.ProjectOwner.SELECT_DEVELOPER_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error selecting developer:", error);
        notify(
          "selectDeveloperError",
          NOTIFICATION_MESSAGES.ProjectOwner.SELECT_DEVELOPER_ERROR,
          "Select Developer Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    initiateIdeationPhase: (state) => {
      try {
        // Logic to initiate the ideation phase
        // This could involve setting a flag in the state or performing other operations

        notify(
          "ideationPhaseInitiated",
          "Ideation Phase Initiated",
          NOTIFICATION_MESSAGES.ProjectOwner.INITIATE_IDEATION_PHASE_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error initiating ideation phase:", error);
        notify(
          "ideationPhaseInitiationError",
          NOTIFICATION_MESSAGES.ProjectOwner.INITIATE_IDEATION_PHASE_ERROR,
          "Error initiating ideation phase",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    formTeam: (state, action: PayloadAction<TeamMember[]>) => {
      try {
        // Logic to form a team
        // This could involve updating the state with team members, creating a team object, etc.

        notify(
          "teamFormed",
          "Team Formed",
          NOTIFICATION_MESSAGES.ProjectOwner.FORM_TEAM_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error forming team:", error);
        notify(
          "teamFormationError",
          NOTIFICATION_MESSAGES.ProjectOwner.FORM_TEAM_ERROR,
          "Error forming team",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    brainstormProduct: (state, action: PayloadAction<any>) => {
      try {
        // Logic to brainstorm product ideas
        // This could involve facilitating brainstorming sessions, collecting ideas, etc.

        notify(
          "productBrainstormingSuccess",
          "Product Brainstorming Success",
          NOTIFICATION_MESSAGES.ProjectOwner.BRAINSTORM_PRODUCT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error brainstorming product:", error);
        notify(
          "productBrainstormingError",
          NOTIFICATION_MESSAGES.ProjectOwner.BRAINSTORM_PRODUCT_ERROR,
          "Error brainstorming product",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    launchProduct: (state) => {
      try {
        // Add logic to launch the product
        state.productLaunched = true;

        notify(
          "launchProductSuccess",
          "Product Launched",
          NOTIFICATION_MESSAGES.ProjectOwner.LAUNCH_PRODUCT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error launching product:", error);
        notify(
          "launchProductError",
          NOTIFICATION_MESSAGES.ProjectOwner.LAUNCH_PRODUCT_ERROR,
          "Launch Product Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    performDataAnalysis: (state) => {
      try {
        // Add logic to perform data analysis
        state.dataAnalysisPerformed = true;

        notify(
          "performDataAnalysisSuccess",
          "Data Analysis Performed",
          NOTIFICATION_MESSAGES.ProjectOwner.PERFORM_DATA_ANALYSIS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error performing data analysis:", error);
        notify(
          "performDataAnalysisError",
          NOTIFICATION_MESSAGES.ProjectOwner.PERFORM_DATA_ANALYSIS_ERROR,
          "Perform Data Analysis Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    participateCommunity: (state) => {
      try {
        // Add logic to participate in the community
        state.communityParticipation = true;

        notify(
          "participateCommunitySuccess",
          "Participated in Community",
          NOTIFICATION_MESSAGES.Community.PARTICIPATE_COMMUNITY_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error participating in community:", error);
        notify(
          "participateCommunityError",
          NOTIFICATION_MESSAGES.Community.PARTICIPATE_COMMUNITY_ERROR,
          "Participate Community Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    promoteUnity: (state) => {
      try {
        // Add logic to promote unity within the community
        state.unityPromoted = true;

        notify(
          "promoteUnitySuccess",
          "Unity Promoted",
          NOTIFICATION_MESSAGES.Community.PROMOTE_UNITY_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error promoting unity:", error);
        notify(
          "promoteUnityError",
          NOTIFICATION_MESSAGES.Community.PROMOTE_UNITY_ERROR,
          "Promote Unity Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    rewardContributions: (state) => {
      try {
        // Add logic to reward contributions within the community
        state.contributionsRewarded = true;

        notify(
          "rewardContributionsSuccess",
          "Contributions Rewarded",
          NOTIFICATION_MESSAGES.Community.REWARD_CONTRIBUTIONS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error rewarding contributions:", error);
        notify(
          "rewardContributionsError",
          NOTIFICATION_MESSAGES.Community.REWARD_CONTRIBUTIONS_ERROR,
          "Reward Contributions Error",
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    buildCustomApps: (state, action: PayloadAction<number>) => {
      try {
        const numberOfApps = action.payload;
        // Add logic to build custom apps

        state.customAppsBuilt += numberOfApps;

        notify(
          "buildCustomAppsSuccess",
          "Custom Apps Built",
          `${numberOfApps} custom apps successfully built.`,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error building custom apps:", error);
        notify(
          "buildCustomAppsError",
          "Build Custom Apps Error",
          NOTIFICATION_MESSAGES.Project.BUILD_CUSTOM_APPS_ERROR,
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    incentivizeProjectMetrics: (state) => {
      try {
        // Add logic to incentivize project metrics
        state.projectMetricsIncentivized = true;

        notify(
          "incentivizeProjectMetricsSuccess",
          "Project Metrics Incentivized",
          NOTIFICATION_MESSAGES.Project.INCENTIVIZE_PROJECT_METRICS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error incentivizing project metrics:", error);
        notify(
          "incentivizeProjectMetricsError",
          "Incentivize Project Metrics Error",
          NOTIFICATION_MESSAGES.Project.INCENTIVIZE_PROJECT_METRICS_ERROR,
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
    contributeToSustainability: (state) => {
      try {
        // Add logic to contribute to sustainability
        state.sustainabilityContributed = true;

        notify(
          "contributeToSustainabilitySuccess",
          "Contribution to Sustainability",
          NOTIFICATION_MESSAGES.Project.CONTRIBUTE_TO_SUSTAINABILITY_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        // Handle errors
        console.error("Error contributing to sustainability:", error);
        notify(
          "contributeToSustainabilityError",
          "Contribute to Sustainability Error",
          NOTIFICATION_MESSAGES.Project.CONTRIBUTE_TO_SUSTAINABILITY_ERROR,
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },
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
export type { ProjectOwnerState};
