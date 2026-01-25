// ProjectOwnerSlice.ts
import type { Meeting } from "@/core/components/communications/scheduler/Meeting";
import type { Team } from "@/core/components/teams/Team";
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import type { ProjectDetails } from '@/core/models/projects/Project';
import type { Task } from "@/core/models/tasks/Task";
import type { TeamMember } from "@/core/models/teams/TeamMembers";
import type { DeveloperPersona } from "@/core/pages/personas/DeveloperPersona";
import { useNotification } from '@/core/state/context/NotificationContext';
import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
import type { RootState } from "@/core/state/redux/slices/RootSlice";
import type { User } from '@/core/users/User';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface ProjectOwnerState {
  // Define the state structure here

  projectDetails: ProjectDetails | null;
  teamMembers: TeamMember[] | null;
  notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
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
  notification: null,
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
        // Store notification in state instead of calling notify()
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_SUCCESS,
          id: 'updateProjectSuccess',
          data: { projectDetails: action.payload }
        };
      } catch (error) {
        // Handle errors
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_PROJECT_ERROR,
          id: 'updateProjectError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            projectDetails: action.payload
          }
        };
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

        // Store notification in state
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.ADD_TEAM_MEMBER_SUCCESS,
          id: 'addTeamMemberSuccess',
          data: { teamMember: action.payload }
        };
      } catch (error) {
        // Handle errors
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.ADD_TEAM_MEMBER_ERROR,
          id: 'addTeamMemberError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            teamMember: action.payload
          }
        };
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

        // Store notification in state
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_SUCCESS,
          id: 'removeTeamMemberSuccess',
          data: { memberId: memberIdToRemove }
        };
      } catch (error) {
        // Handle errors
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.REMOVE_TEAM_MEMBER_ERROR,
          id: 'removeTeamMemberError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            memberId: action.payload.memberId
          }
        };
      }
    },
    
    // Add a reducer to clear notifications
    clearNotification: (state) => {
      state.notification = null;
    },

  assignTask: (
    state,
    action: PayloadAction<{ taskId: number; teamMemberId: number }>
  ) => {
    const { taskId, teamMemberId } = action.payload;
    
    try {
      // Ensure state.tasks is not null before attempting to access it
      if (!state.tasks) {
        throw new Error("Tasks array in state is null");
      }
      
      if (!state.users) {
        throw new Error("Users array in state is null");
      }
      
      const task = state.tasks.find(task => task.id === String(taskId));
      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }
      
      const user = state.users.find(user => user.id === teamMemberId);
      if (!user) {
        throw new Error(`User with id ${teamMemberId} not found`);
      }
      
      task.assignedTo = user;
      
      // Store success notification in state
      state.notification = {
        type: 'success',
        message: NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_SUCCESS,
        id: 'assignTaskSuccess',
        data: { taskId, teamMemberId, assignedTo: user.name || user.id }
      };
      
    } catch (error) {
      // Store error notification in state
      state.notification = {
        type: 'error',
        message: NOTIFICATION_MESSAGES.ProjectOwner.ASSIGN_TASK_ERROR,
        id: 'assignTaskError',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          taskId,
          teamMemberId
        }
      };
    }
  },

    createMeeting: (state, action: PayloadAction<any>) => {
      try {
        const meetingData = action.payload;
        // Your synchronous logic here
        // state.meetings.push(meetingData);
        
        // Store success notification in state
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.CREATE_MEETING_SUCCESS,
          id: 'createMeetingSuccess',
          data: { meetingData }
        };
      } catch (error) {
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.CREATE_MEETING_ERROR,
          id: 'createMeetingError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            meetingData: action.payload
          }
        };
      }
    },

    updateMeeting: (state, action: PayloadAction<any>) => {
      try {
        const meetingId = action.payload.id;
        let found = false;
        
        // Find meeting in state by id and update
        if (state.meetings) {
          state.meetings.forEach((meeting) => {
            if (meeting.id === meetingId) {
              meeting.title = action.payload.title;
              meeting.description = action.payload.description;
              meeting.date = action.payload.date;
              found = true;
            }
          });
        }

        if (found) {
          state.notification = {
            type: 'success',
            message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_SUCCESS,
            id: 'updateMeetingSuccess',
            data: { meetingId, updates: action.payload }
          };
        } else {
          throw new Error(`Meeting with id ${meetingId} not found`);
        }
      } catch (error) {
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_ERROR,
          id: 'updateMeetingError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            meetingId: action.payload?.id
          }
        };
      }
    },

    deleteMeeting: (state, action: PayloadAction<any>) => {
      try {
        const id = action.payload;
        let found = false;

        if (state.meetings) {
          state.meetings = state.meetings.filter((meeting) => {
            if (meeting.id === id) {
              found = true;
              return false;
            }
            return true;
          });
        }

        if (found) {
          state.notification = {
            type: 'success',
            message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_SUCCESS,
            id: 'deleteMeetingSuccess',
            data: { meetingId: id }
          };
        } else {
          throw new Error(`Meeting with id ${id} not found`);
        }
      } catch (error) {
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_ERROR,
          id: 'deleteMeetingError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            meetingId: action.payload
          }
        };
      }
    },

    getTeamMembers: (state, action: PayloadAction<any>) => {
      try {
        // Extract team members from state
        const teamMembers = state.teamMembers || [];
        
        // Store success notification in state
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.GET_TEAM_MEMBERS_SUCCESS,
          id: 'getTeamMembersSuccess',
          data: { count: teamMembers.length }
        };
      } catch (error) {
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.GET_TEAM_MEMBERS_ERROR,
          id: 'getTeamMembersError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    },
   
    generateReport: (
      state,
      action: PayloadAction<{ reportData: any; customSections?: string[] }>
    ) => {
      try {
        const { reportData, customSections } = action.payload;

        // Generate report using reportData and customSections
        const report = generateReport(
          JSON.parse(JSON.stringify(state)) as ProjectOwnerState,
          reportData,
          customSections
        );
        
        // Store success notification in state
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.GENERATE_REPORT_SUCCESS,
          id: 'generateReportSuccess',
          data: {
            reportData,
            customSections,
            reportGenerated: !!report
          }
        };

        // Optionally return the generated report
        return report;
      } catch (error) {
        console.error("Error generating report:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.GENERATE_REPORT_ERROR,
          id: 'generateReportError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            reportData: action.payload.reportData
          }
        };
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
          state.notification = {
            type: 'success',
            message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_TASK_SUCCESS,
            id: 'updateTaskSuccess',
            data: { taskId, updatedTask }
          };
        } else {
          // Task not found
          state.notification = {
            type: 'error',
            message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_TASK_ERROR,
            id: 'updateTaskError',
            data: {
              error: `Task with ID ${taskId} not found`,
              taskId
            }
          };
        }
      } catch (error) {
        console.error("Error updating task:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_TASK_ERROR,
          id: 'updateTaskError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            taskId: action.payload.taskId
          }
        };
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      try {
        const taskIdToDelete = action.payload;

        // Check if state.tasks is not null or undefined
        if (state.tasks) {
          const initialLength = state.tasks.length;
          state.tasks = state.tasks.filter((task) => task.id !== taskIdToDelete);
          
          if (state.tasks.length < initialLength) {
            // Task was deleted
            state.notification = {
              type: 'success',
              message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_TASK_SUCCESS,
              id: 'deleteTaskSuccess',
              data: { taskId: taskIdToDelete }
            };
          } else {
            // Task not found
            state.notification = {
              type: 'error',
              message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_TASK_ERROR,
              id: 'deleteTaskError',
              data: {
                error: `Task with ID ${taskIdToDelete} not found`,
                taskId: taskIdToDelete
              }
            };
          }
        } else {
          // state.tasks is null or undefined
          state.notification = {
            type: 'error',
            message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_TASK_ERROR,
            id: 'deleteTaskError',
            data: {
              error: "state.tasks is null or undefined",
              taskId: taskIdToDelete
            }
          };
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_TASK_ERROR,
          id: 'deleteTaskError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            taskId: action.payload
          }
        };
      }
    },

    hireDeveloper: (state, action: PayloadAction<DeveloperPersona>) => {
      try {
        const developerId = action.payload;
        
        // Ensure developers array exists
        if (!state.developers) {
          state.developers = [];
        }
        
        // Add logic to hire the developer
        state.developers.push(developerId);
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.HIRE_DEVELOPER_SUCCESS,
          id: 'hireDeveloperSuccess',
          data: { developerId }
        };
      } catch (error) {
        console.error("Error hiring developer:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.HIRE_DEVELOPER_ERROR,
          id: 'hireDeveloperError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            developerId: action.payload
          }
        };
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
          state.notification = {
            type: 'success',
            message: NOTIFICATION_MESSAGES.ProjectOwner.COMPENSATE_DEVELOPER_SUCCESS,
            id: 'compensateDeveloperSuccess',
            data: { developerId, amount, newCompensation: developer.compensation }
          };
        } else {
          state.notification = {
            type: 'error',
            message: NOTIFICATION_MESSAGES.ProjectOwner.COMPENSATE_DEVELOPER_ERROR,
            id: 'compensateDeveloperError',
            data: {
              error: `Developer with ID ${developerId} not found`,
              developerId,
              amount
            }
          };
        }
      } catch (error) {
        console.error("Error compensating developer:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.COMPENSATE_DEVELOPER_ERROR,
          id: 'compensateDeveloperError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            developerId: action.payload.developerId,
            amount: action.payload.amount
          }
        };
      }
    },

    selectDeveloper: (state, action: PayloadAction<string>) => {
      try {
        const selectedDeveloperId = action.payload;

        // Check if developer exists
        const developerExists = state.developers?.some(dev => dev.id === selectedDeveloperId);
        
        if (developerExists || state.developers?.length === 0) {
          // select the developer
          state.selectedDeveloper = selectedDeveloperId;
          state.notification = {
            type: 'success',
            message: NOTIFICATION_MESSAGES.ProjectOwner.SELECT_DEVELOPER_SUCCESS,
            id: 'selectDeveloperSuccess',
            data: { selectedDeveloperId }
          };
        } else {
          state.notification = {
            type: 'error',
            message: NOTIFICATION_MESSAGES.ProjectOwner.SELECT_DEVELOPER_ERROR,
            id: 'selectDeveloperError',
            data: {
              error: `Developer with ID ${selectedDeveloperId} not found`,
              selectedDeveloperId
            }
          };
        }
      } catch (error) {
        console.error("Error selecting developer:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.SELECT_DEVELOPER_ERROR,
          id: 'selectDeveloperError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            selectedDeveloperId: action.payload
          }
        };
      }
    },

    initiateIdeationPhase: (state) => {
      try {
        // Logic to initiate the ideation phase
        state.currentPhase = 'ideation';
        state.ideationInitiated = true;
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.INITIATE_IDEATION_PHASE_SUCCESS,
          id: 'ideationPhaseInitiated',
          data: { phase: 'ideation', timestamp: new Date().toISOString() }
        };
      } catch (error) {
        console.error("Error initiating ideation phase:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.INITIATE_IDEATION_PHASE_ERROR,
          id: 'ideationPhaseInitiationError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    },

    formTeam: (state, action: PayloadAction<TeamMember[]>) => {
      try {
        // Logic to form a team
        const teamMembers = action.payload;
        state.teamMembers = [...(state.teamMembers || []), ...teamMembers];
        state.teamFormed = true;
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.FORM_TEAM_SUCCESS,
          id: 'teamFormed',
          data: {
            teamMembersCount: teamMembers.length,
            totalTeamMembers: state.teamMembers?.length || 0
          }
        };
      } catch (error) {
        console.error("Error forming team:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.FORM_TEAM_ERROR,
          id: 'teamFormationError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            teamMembersCount: action.payload.length
          }
        };
      }
    },

    brainstormProduct: (state, action: PayloadAction<any>) => {
      try {
        // Logic to brainstorm product ideas
        const brainstormData = action.payload;
        state.brainstormingSession = {
          ...brainstormData,
          timestamp: new Date().toISOString()
        };
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.BRAINSTORM_PRODUCT_SUCCESS,
          id: 'productBrainstormingSuccess',
          data: {
            brainstormData,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error("Error brainstorming product:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.BRAINSTORM_PRODUCT_ERROR,
          id: 'productBrainstormingError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            brainstormData: action.payload
          }
        };
      }
    },

    launchProduct: (state) => {
      try {
        // Add logic to launch the product
        state.productLaunched = true;
        state.productLaunchDate = new Date().toISOString();
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.LAUNCH_PRODUCT_SUCCESS,
          id: 'launchProductSuccess',
          data: {
            launchDate: state.productLaunchDate,
            productLaunched: true
          }
        };
      } catch (error) {
        console.error("Error launching product:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.LAUNCH_PRODUCT_ERROR,
          id: 'launchProductError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    },

    performDataAnalysis: (state) => {
      try {
        // Add logic to perform data analysis
        state.dataAnalysisPerformed = true;
        state.dataAnalysisDate = new Date().toISOString();
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.ProjectOwner.PERFORM_DATA_ANALYSIS_SUCCESS,
          id: 'performDataAnalysisSuccess',
          data: {
            dataAnalysisPerformed: true,
            analysisDate: state.dataAnalysisDate
          }
        };
      } catch (error) {
        console.error("Error performing data analysis:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.ProjectOwner.PERFORM_DATA_ANALYSIS_ERROR,
          id: 'performDataAnalysisError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    },

    participateCommunity: (state) => {
      try {
        // Add logic to participate in the community
        state.communityParticipation = true;
        state.communityParticipationDate = new Date().toISOString();
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.Community.PARTICIPATE_COMMUNITY_SUCCESS,
          id: 'participateCommunitySuccess',
          data: {
            communityParticipation: true,
            participationDate: state.communityParticipationDate
          }
        };
      } catch (error) {
        console.error("Error participating in community:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.Community.PARTICIPATE_COMMUNITY_ERROR,
          id: 'participateCommunityError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    },

    promoteUnity: (state) => {
      try {
        // Add logic to promote unity within the community
        state.unityPromoted = true;
        state.unityPromotionDate = new Date().toISOString();
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.Community.PROMOTE_UNITY_SUCCESS,
          id: 'promoteUnitySuccess',
          data: {
            unityPromoted: true,
            promotionDate: state.unityPromotionDate
          }
        };
      } catch (error) {
        console.error("Error promoting unity:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.Community.PROMOTE_UNITY_ERROR,
          id: 'promoteUnityError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    },

    rewardContributions: (state) => {
      try {
        // Add logic to reward contributions within the community
        state.contributionsRewarded = true;
        state.rewardsDate = new Date().toISOString();
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.Community.REWARD_CONTRIBUTIONS_SUCCESS,
          id: 'rewardContributionsSuccess',
          data: {
            contributionsRewarded: true,
            rewardsDate: state.rewardsDate
          }
        };
      } catch (error) {
        console.error("Error rewarding contributions:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.Community.REWARD_CONTRIBUTIONS_ERROR,
          id: 'rewardContributionsError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    },

    buildCustomApps: (state, action: PayloadAction<number>) => {
      try {
        const numberOfApps = action.payload;
        // Add logic to build custom apps
        
        // Initialize if not exists
        if (!state.customAppsBuilt) {
          state.customAppsBuilt = 0;
        }
        
        state.customAppsBuilt += numberOfApps;
        
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.Project.BUILD_CUSTOM_APPS_SUCCESS || `${numberOfApps} custom apps successfully built.`,
          id: 'buildCustomAppsSuccess',
          data: {
            numberOfAppsBuilt: numberOfApps,
            totalCustomApps: state.customAppsBuilt,
            buildDate: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error("Error building custom apps:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.Project.BUILD_CUSTOM_APPS_ERROR,
          id: 'buildCustomAppsError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error',
            numberOfApps: action.payload
          }
        };
      }
    },
    incentivizeProjectMetrics: (state) => {
      try {
        // Add logic to incentivize project metrics
        state.projectMetricsIncentivized = true;
        state.metricsIncentivizedDate = new Date().toISOString();
      
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.Project.INCENTIVIZE_PROJECT_METRICS_SUCCESS,
          id: 'incentivizeProjectMetricsSuccess',
          data: {
            projectMetricsIncentivized: true,
            incentivizedDate: state.metricsIncentivizedDate
          }
        };
      } catch (error) {
        console.error("Error incentivizing project metrics:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.Project.INCENTIVIZE_PROJECT_METRICS_ERROR,
          id: 'incentivizeProjectMetricsError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    },

    contributeToSustainability: (state) => {
      try {
        // Add logic to contribute to sustainability
        state.sustainabilityContributed = true;
        state.sustainabilityContributionDate = new Date().toISOString();
  
        state.notification = {
          type: 'success',
          message: NOTIFICATION_MESSAGES.Project.CONTRIBUTE_TO_SUSTAINABILITY_SUCCESS,
          id: 'contributeToSustainabilitySuccess',
          data: {
            sustainabilityContributed: true,
            contributionDate: state.sustainabilityContributionDate
          }
        };
      } catch (error) {
        console.error("Error contributing to sustainability:", error);
        state.notification = {
          type: 'error',
          message: NOTIFICATION_MESSAGES.Project.CONTRIBUTE_TO_SUSTAINABILITY_ERROR,
          id: 'contributeToSustainabilityError',
          data: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    }
  }
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

Selectors
export const selectProjectOwner = (state: RootState) => state.projectOwner;

// Export the reducer
export default useProjectOwnerSlice.reducer;
export type { ProjectOwnerState };

