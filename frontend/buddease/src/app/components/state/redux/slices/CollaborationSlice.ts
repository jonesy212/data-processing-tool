// CollaborationSlice.ts
import { Meeting } from "@/app/components/communications/scheduler/Meeting";
import { Task } from "@/app/components/models/tasks/Task";
import { Member } from "@/app/components/models/teams/TeamMembers";
import { Project } from "@/app/components/projects/Project";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";

interface CollaborationState {
  sharedProjects: Project[];
    sharedMeetings: Meeting[];
    tasks: Task[]
  // Add other collaboration-related state properties here
}

const initialState: CollaborationState = {
  sharedProjects: [],
    sharedMeetings: [],
  tasks: []
  // Initialize other collaboration-related state properties here
};

export const useCollaborationSlice = createSlice({
    name: "collaboration",
    initialState,
    reducers: {
        shareProject(state, action: PayloadAction<Project>) {
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
        assignTask(state, action: PayloadAction<{
            taskId: string;
            assigneeId: string;
        }>) {
            // Logic to assign a task to a user
            const taskIndex = state.tasks.findIndex(task => task.id === action.payload.taskId);
            if (taskIndex !== -1) {
              const task = state.tasks[taskIndex];
              task.assigneeId = action.payload.assigneeId;
              state.tasks[taskIndex] = task;
            }
        },
        unassignTask(state, action: PayloadAction<{
            taskId: string;
        }>) {
            // Logic to unassign a task from a user
            const taskIndex = state.tasks.findIndex(task => task.id === action.payload.taskId);
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
            const taskIndex = state.tasks.findIndex(task => task.id === action.payload.taskId);
            if (taskIndex !== -1) {
              const updatedTasks = [...state.tasks];
              updatedTasks[taskIndex].isCompleted = true;
              return { ...state, tasks: updatedTasks };
            }
            return state;
          },
          
          sendCommunication(state, action: PayloadAction<Communication>) {
            state.communications.push(action.payload);
          }
          // Add other collaboration-related reducers here
          

    // Add other collaboration-related reducers here
  },
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
  // Conflict resolution actions
  resolveConflict,
  escalateConflict,
  // Security measures actions
  implementSecurityMeasures,
  enforceDataPrivacy,
  // Training and mentorship actions
  facilitateTraining,
  provideMentorship,
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
