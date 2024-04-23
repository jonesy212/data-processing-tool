// CollaborationSlice.ts
import Milestone from "@/app/components/calendar/CalendarSlice";
import { Meeting } from "@/app/components/communications/scheduler/Meeting";
import CryptoTransaction from "@/app/components/crypto/CryptoTransaction";
import { CollaborationOptions } from "@/app/components/interfaces/options/CollaborationOptions";
import { Task } from "@/app/components/models/tasks/Task";
import { Member } from "@/app/components/models/teams/TeamMembers";
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { Project } from "@/app/components/projects/Project";
import { Feedback } from "@/app/components/support/Feedback";
import { Idea } from "@/app/components/users/Ideas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import CollaborationSettings from '../../../../pages/community/CollaborationSettings';
import { Communication } from "../../../communications/chat/Communication";
import CommunityContribution from '../../../crypto/CommunityContribution';
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";
import Whiteboard from '../../../whiteboard/Whiteboard';
interface Resource {
  id: string;
  name: string;
  description: string;
  // Add other properties specific to a resource
}


// Define the ResourceType enum if needed
enum ResourceType {
    Document,
    Image,
    Link,
    Other,
  }
interface CollaborationState {
  sharedProjects: Project[];
  sharedMeetings: Meeting[];
  tasks: Task[];
  communications: Communication[];
  sharedResources: Resource[];
  projects: Project[];
    milestones: Milestone[];
    members: Member[];
    cryptoTransactions: CryptoTransaction[];
    cryptoHoldings: CryptoHolding[];
    communityCoinLiquidity: CommunityCoinLiquidity;
    communityContributions: CommunityContribution[];
    ideas: Idea[];
    collaborationOptions: CollaborationOptions[]
    collaborationSettings: typeof CollaborationSettings[]
    selectedTask: Task | null;
    isLoadingTaskDetails: boolean;
    error: string | null;
    whiteboards: typeof Whiteboard[];
    isBrainstorming: boolean;
    brainstormingTopic: string
    brainstormingIdeas: Idea[]
  // Add other collaboration-related state properties here
}

const initialState: CollaborationState = {
    sharedProjects: [],
    sharedMeetings: [],
    tasks: [],
    // Initialize other collaboration-related state properties here
    communications: [],
    sharedResources: [],
    projects: [],
    milestones: [],
    members: [],
    cryptoTransactions: [],
    cryptoHoldings: [],
    communityCoinLiquidity: {} as CommunityCoinLiquidity,
    communityContributions: [],
    ideas: [],
    collaborationOptions: [],
    collaborationSettings: [],
    selectedTask: null,
    isLoadingTaskDetails: false,
    error: null,
    whiteboards: [],
    isBrainstorming: false,
    brainstormingTopic: "",
    brainstormingIdeas: []
};

export const useCollaborationSlice = createSlice({
    name: "collaboration",
    initialState,
    reducers: {
        shareProject(state, action: PayloadAction<WritableDraft<Project>>) {
            state.sharedProjects.push(action.payload);
        },
        unshareProject(state, action: PayloadAction<string>) {
            state.sharedProjects = state.sharedProjects.filter(
                (project) => project.id !== action.payload
            );
        },
        // Add reducer functions for other collaboration actions here
        inviteMembersToProject(
            state,
            action: PayloadAction<{
                projectId: string;
                members: WritableDraft<Member>[];
            }>
        ) {
            const projectIndex = state.sharedProjects.findIndex(
                (project) => project.id === action.payload.projectId
            );
            const project = state.sharedProjects[projectIndex];
            if (projectIndex !== -1) {
                project.members = [...project.members, ...action.payload.members];
                state.sharedProjects[projectIndex] = project;
            }
            // Add invited members to project members array
            project.members.push(...action.payload.members);
            //
        },
        removeMemberFromProject(
            state,
            action: PayloadAction<{
                projectId: string;
                memberId: string;
            }>
        ) {
            const projectIndex = state.sharedProjects.findIndex(
                (project) => project.id === action.payload.projectId
            );
            if (projectIndex !== -1) {
                const project = state.sharedProjects[projectIndex];
                project.members = project.members.filter(
                    (member) => member.id !== action.payload.memberId
                );
                if (project.members.length) {
                    state.sharedProjects[projectIndex] = project;
                } else {
                    state.sharedProjects.splice(projectIndex, 1);
                }
            }
        },

        shareMeeting(state, action: PayloadAction<Meeting>) {
            state.sharedMeetings.push(action.payload);
        },
        unshareMeeting(state, action: PayloadAction<number>) {
            state.sharedMeetings = state.sharedMeetings.filter(
                (meeting) => meeting.id !== action.payload
            );
        },
        scheduleMeeting(state, action: PayloadAction<Meeting>) {
            state.sharedMeetings.push(action.payload);
        },

        cancelMeeting(state, action: PayloadAction<number>) {
            state.sharedMeetings = state.sharedMeetings.filter(
                (meeting) => meeting.id !== action.payload
            );
        },
        assignTask(
            state,
            action: PayloadAction<{
                taskId: string;
                assigneeId: string;
            }>
        ) {
            // Logic to assign a task to a user
            const taskIndex = state.tasks.findIndex(
                (task) => task.id === action.payload.taskId
            );
            if (taskIndex !== -1) {
                const task = state.tasks[taskIndex];
                task.assigneeId = action.payload.assigneeId;
                state.tasks[taskIndex] = task;
            }
        },
        unassignTask(
            state,
            action: PayloadAction<{
                taskId: string;
            }>
        ) {
            // Logic to unassign a task from a user
            const taskIndex = state.tasks.findIndex(
                (task) => task.id === action.payload.taskId
            );
            if (taskIndex !== -1) {
                const task = state.tasks[taskIndex];
                task.assigneeId = undefined;
                state.tasks[taskIndex] = task;
            }
            if (taskIndex !== -1) {
                state.tasks.splice(taskIndex, 1);
            }
        },

        markTaskAsCompleted(
            state,
            action: PayloadAction<{
                taskId: string;
            }>
        ) {
            // Logic to mark a task as completed
            const taskIndex = state.tasks.findIndex(
                (task) => task.id === action.payload.taskId
            );
            if (taskIndex !== -1) {
                const updatedTasks = [...state.tasks];
                updatedTasks[taskIndex].isCompleted = true;
                return { ...state, tasks: updatedTasks };
            }
            return state;
        },

        sendCommunication(state, action: PayloadAction<Communication>) {
            state.communications.push(action.payload);
        },
        receiveCommunication(state, action: PayloadAction<Communication>) {
            state.communications.push(action.payload);
        },
        shareResource(state, action: PayloadAction<Resource>) {
            state.sharedResources.push(action.payload);
        },
        unshareResource(state, action: PayloadAction<Resource>) {
            state.sharedResources = state.sharedResources.filter(
                (resource) => resource.id !== action.payload.id
            );
        },

        trackProjectProgress(
            state,
            action: PayloadAction<{
                projectId: string;
                progress: Progress;
            }>
        ) {
            // Logic to track progress of a project
            const projectIndex = state.projects.findIndex(
                (project) => project.id === action.payload.projectId
            );
            if (projectIndex !== -1) {
                const project = state.projects[projectIndex];
                project.progress = project.progress + 1;
                state.projects[projectIndex] = project;
            }
        },

        trackTaskProgress(
            state,
            action: PayloadAction<{
                taskId: string;
                progress: Progress;
            }>
        ) {
            // Logic to track progress of a task
            const taskIndex = state.tasks.findIndex(
                (task) => task.id === action.payload.taskId
            );
            if (taskIndex !== -1) {
                const task = state.tasks[taskIndex];
                task.progress = action.payload.progress;
                state.tasks[taskIndex] = task;
            }
        },
        provideProjectFeedback(
            state,
            action: PayloadAction<{
                projectId: string;
                feedback: Feedback;
            }>
        ) {
            // Logic to add feedback for a project
            const projectIndex = state.projects.findIndex(
                (project) => project.id === action.payload.projectId
            );
            if (projectIndex !== -1) {
                const project = state.projects[projectIndex];
                project.feedback = [...project.feedback, action.payload.feedback];
                state.projects[projectIndex] = project;
            }
            return state;
        },

        provideTaskFeedback(
            state,
            action: PayloadAction<{
                taskId: string;
                feedback: Feedback;
            }>
        ) {
            // Logic to ad feedback for a task
            const taskIndex = state.tasks.findIndex(
                (task) => task.id === action.payload.taskId
            );
            if (taskIndex !== -1) {
                const task = state.tasks[taskIndex];
                task.feedback = [...task.feedback, action.payload.feedback];
                state.tasks[taskIndex] = task;
            }
            return state;
        },

        createMilestone(state, action: PayloadAction<Milestone>) {
            const existingMilestone = state.milestones.find(
                (milestone) => milestone.id === action.payload.id
            );
            if (existingMilestone) {
                return state;
            }
            // Logic to create a new milestone
            state.milestones.push(action.payload);

            // Return new state with updated milestones array
            return {
                ...state,
                milestones: [...state.milestones, action.payload],
            };
        },

        updateMilestone: (state, action: PayloadAction<Milestone>) => {
            // Logic to update a milestone
            const milestoneIndex = state.milestones.findIndex(
                (milestone) => milestone.id === action.payload.id
            );
            if (milestoneIndex !== -1) {
                const milestone = state.milestones[milestoneIndex];
                Object.assign(milestone, action.payload);
                state.milestones[milestoneIndex] = milestone;
            }
            return {
                ...state,
            };
        },

        deleteMilestone: (
            state,
            action: PayloadAction<{ milestoneId: string }>
        ) => {
            // Logic to delete a milestone
            const milestoneIndex = state.milestones.findIndex(
                (milestone) => milestone.id === action.payload.milestoneId
            );
            if (milestoneIndex !== -1) {
                state.milestones.splice(milestoneIndex, 1);
            }
            return {
                ...state,
                milestones: state.milestones,
            };
        },
        ensureAccessibility: (state) => {
            // Check projects for accessibility
            state.projects.forEach((project) => {
                // Check each project property meets standards
                // e.g.
                if (!project.name || project.name.trim().length === 0) {
                    throw new Error("Project name cannot be empty");
                }
            });
            // Logic to ensure all data conforms with accessibility standards
            return state;
        },
        improveUsability: (state) => {
            // Check for usability improvements
            state.projects.forEach((project) => {
                // Add default values if missing
                if (!project.description) {
                    project.description = "";
                }
            })
          
        },
        analyzeData: (
            state,
            action: PayloadAction<{
                startDate: Date;
                endDate: Date;
            }>
        ): WritableDraft<CollaborationState> => {
            const { startDate, endDate } = action.payload;

            // Logic to analyze collaboration data
            const projectStats = {
                totalTasks: 0,
                totalTimeSpent: 0,
                totalTasksCompleted: 0,
                averageTaskTime: 0,
                projectsCompleted: 0,
                overdueTasks: 0,
                totalMembers: 0,
                totalProjectDuration: 0,
                totalCryptoTransactions: 0,
                totalCryptoValue: 0,
                averageTransactionValue: 0,
                totalCommunityCoinLiquidity: 0,
                totalCommunityContributions: 0,
                ...state,
            };

            state.projects.forEach((project) => {
                // Calculate total tasks and time spent on tasks
                projectStats.totalTasks += project.tasks.length;
                projectStats.totalTimeSpent += project.tasks.reduce((total, task) => {
                    return total + task.timeSpent;
                }, 0);

                // Calculate total completed tasks
                projectStats.totalTasksCompleted += project.tasks.filter(
                    (task) => task.status === "COMPLETED"
                ).length;

                // Calculate average task time
                projectStats.averageTaskTime +=
                    project.tasks.reduce((totalTime, task) => {
                        return totalTime + task.timeSpent;
                    }, 0) / project.tasks.length;

                // Calculate number of projects completed
                if (project.status === "COMPLETED") {
                    projectStats.projectsCompleted++;
                }

                // Additional metrics based on the type of app - Project Management
                // Calculate overdue tasks
                projectStats.overdueTasks += project.tasks.filter((task) => {
                    return (
                        task.dueDate &&
                        task.dueDate >= startDate &&
                        task.dueDate <= endDate &&
                        task.status !== "COMPLETED"
                    );
                }).length;

                // Calculate total members across all projects
                projectStats.totalMembers += project.members.length;

                // Calculate average project duration
                if (project.startDate && project.endDate) {
                    const projectDuration = Math.abs(
                        new Date(project.endDate).getTime() -
                        new Date(project.startDate).getTime()
                    );
                    projectStats.totalProjectDuration += projectDuration;
                }
            });

            // Additional metrics based on the type of app - Crypto Integration
            // Calculate total crypto transactions
            projectStats.totalCryptoTransactions += state.cryptoTransactions.length;

            // Calculate total value of crypto holdings
            projectStats.totalCryptoValue = state.cryptoHoldings.reduce(
                (totalValue, holding) => {
                    return totalValue + holding.value;
                },
                0
            );

            // Calculate average transaction value
            projectStats.averageTransactionValue =
                projectStats.totalCryptoTransactions !== 0
                    ? projectStats.totalCryptoValue / projectStats.totalCryptoTransactions
                    : 0;

            // Calculate total community coin liquidity
            projectStats.totalCommunityCoinLiquidity =
                state.communityCoinLiquidity.value;

            // Calculate total community contributions
            projectStats.totalCommunityContributions +=
                state.communityContributions.length;

            return projectStats;
        },
    
        interpretAnalysisResults: (
            state,
            action: PayloadAction<{
                projectStats: any;
                startDate: string;
                endDate: string;
            }>
        ): WritableDraft<CollaborationState> => {
            const { projectStats, startDate, endDate } = action.payload;
            const interpretation = {
                projectStatistics: projectStats,
                analysisPeriod: {
                    startDate,
                    endDate,
                },
            };
            return state;
        },

        shareIdea: (state, action) => {
            const { idea } = action.payload;

            state.ideas.push(idea);

            return state;
        },

        discussIdea: (state, action) => {
            const { idea, comment } = action.payload;

            const updatedIdea = {
                ...idea,
                comments: [...idea.comments, comment]
            };

            return {
                ...state,
                ideas: state.ideas.map(i => {
                    if (i.id === idea.id) {
                        return updatedIdea;
                    } else {
                        return i;
                    }
                })
            };
            
        },
        configureCollaborationOptions: (
            state,
            action: PayloadAction<{
                options: WritableDraft<CollaborationOptions>[];
            }>
        ): WritableDraft<CollaborationState> => {
            const { options } = action.payload;

            return {
                ...state,
                collaborationOptions: options
            };
        },

        updateCollaborationSettings: (
            state,
            action: PayloadAction<{
                settings: typeof CollaborationSettings[];
            }>
        ): WritableDraft<CollaborationState> => {
            const { settings } = action.payload;

            // Validate settings
            if (!settings) {
                return state;
            }

            return {
                ...state,
                collaborationSettings: settings,
            };
        },
    
        createTask: (state, action) => {
            const { task } = action.payload;

            state.tasks.push(task);

            return state;
        },
        updateTask: (state, action) => {
            const { task } = action.payload;

            return {
                ...state,
                tasks: state.tasks.map(t => {
                    if (t.id === task.id) {
                        return task;
                    } else {
                        return t;
                    }
                })
            }
        },

        deleteTask: (state: CollaborationState, action: PayloadAction<string>): void => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload);
          },
        
          getTaskDetails: (state: CollaborationState, action: PayloadAction<string>): void => {
            const taskId = action.payload;
            
            // Find the task in the state by its ID
            const task = state.tasks.find(task => task.id === taskId);
          
            if (task) {
              // Update state with the task details
              state.selectedTask = task;
              state.isLoadingTaskDetails = false; // Optionally, update loading state
              state.error = null; // Optionally, clear any previous errors
            } else {
              // Handle case where task is not found
              state.selectedTask = null;
              state.isLoadingTaskDetails = false;
              state.error = "Task not found";
            }
          },
          
        
          listTasks: (state: CollaborationState, action: PayloadAction<WritableDraft<Task[]>>): void => {
            state.tasks = action.payload;
          },
        
          startBrainstorming: (state: CollaborationState, action: PayloadAction<string>): void => {
            const topic = action.payload;
            
            // Update state to indicate that brainstorming has started
            state.isBrainstorming = true;
            state.brainstormingTopic = topic;
          },
          
    endBrainstorming: (
      state: CollaborationState,
      action: PayloadAction<void>
    ): void => {
      // Reset brainstorming-related state
      state.isBrainstorming = false;
      state.brainstormingTopic = "";
      state.brainstormingIdeas = [];
    },
        
          createWhiteboard: (state: CollaborationState, action: PayloadAction<typeof Whiteboard>): void => {
            state.whiteboards.push(action.payload);
          },
        
    updateWhiteboard: (
      state: CollaborationState,
      action: PayloadAction<Whiteboard>
    ): void => {
      const updatedWhiteboard = action.payload;
      state.whiteboards = state.whiteboards.map((whiteboard) => {
        if (whiteboard.id === updatedWhiteboard.id) {
          return { ...whiteboard, ...updatedWhiteboard };
        }
        return whiteboard;
      });
    },
          deleteWhiteboard: (state: CollaborationState, action: PayloadAction<number>): void => {
            state.whiteboards = state.whiteboards.filter(whiteboard => whiteboard.id !== action.payload);
          },
        
        






    }
    // Add other collaboration-related reducers here
});

export const {
  // Project sharing actions
  shareProject,
  unshareProject,
  inviteMembersToProject,
  removeMemberFromProject,
  // Meeting sharing actions
  shareMeeting,
  unshareMeeting,
  scheduleMeeting,
  cancelMeeting,
  // Task collaboration actions
  assignTask,
  unassignTask,
  markTaskAsCompleted,
  // Communication actions
  sendCommunication,
  receiveCommunication,
  // Resource sharing actions
  shareResource,
  unshareResource,
  // Progress tracking actions
  trackProjectProgress,
  trackTaskProgress,
  // Feedback and review actions
  provideProjectFeedback,
  provideTaskFeedback,
  // Milestone actions
  createMilestone,
  updateMilestone,
  deleteMilestone,
  //todo finish updating
  //   // Conflict resolution actions
  //   resolveConflict,
  //   escalateConflict,
  //   // Security measures actions
  //   implementSecurityMeasures,
  //   enforceDataPrivacy,
  //   // Training and mentorship actions
  //   facilitateTraining,
  //   provideMentorship,

  // Accessibility actions
  ensureAccessibility,
  improveUsability,
  // Data analysis actions
  analyzeData,
  interpretAnalysisResults,
  // Idea and brainstorming actions
  shareIdea,
  discussIdea,
  // Collaboration settings actions
  configureCollaborationOptions,
  updateCollaborationSettings,

  // Task actions
  createTask,
  updateTask,
  deleteTask,
  getTaskDetails,
  listTasks,

  // Brainstorming actions
  startBrainstorming,
  endBrainstorming,

  // Whiteboard actions
  createWhiteboard,
  updateWhiteboard,
  deleteWhiteboard,
  getWhiteboardDetails,
  listWhiteboards,

  // Document actions
  shareDocument,
  commentOnDocument,
  resolveComment,
  updateDocument,
  deleteDocument,
  getDocumentDetails,
  listDocuments,
} = useCollaborationSlice.actions;

// Selectors
export const selectSharedProjects = (state: RootState) =>
  state.collaborationManager.sharedProjects;
export const selectSharedMeetings = (state: RootState) =>
  state.collaborationManager.sharedMeetings;
// Add other selectors as needed

// Reducer
export default useCollaborationSlice.reducer;
