// CollaborationSlice.ts
import Milestone from "@/app/components/calendar/CalendarSlice";
import { Meeting } from "@/app/components/communications/scheduler/Meeting";
import { CryptoHolding } from "@/app/components/crypto/CryptoHolding";
import CryptoTransaction from "@/app/components/crypto/CryptoTransaction";
import { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { DocumentBuilderOptions } from "@/app/components/documents/DocumentOptions";
import DocumentPermissions from '@/app/components/documents/DocumentPermissions';
import { Change } from "@/app/components/documents/NoteData";
import { mergeChanges } from "@/app/components/documents/editing/autosave";
import { CollaborationOptions } from "@/app/components/interfaces/options/CollaborationOptions";
import { BaseData, Data } from '@/app/components/models/data/Data';
import { StatusType } from '@/app/components/models/data/StatusType';
import { K, Meta, T } from '@/app/components/models/data/dataStoreMethods';
import { Task } from "@/app/components/models/tasks/Task";
import { Member } from "@/app/components/models/teams/TeamMembers";
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { Project } from "@/app/components/projects/Project";
import { SecurityMeasure } from "@/app/components/security/SecurityMeasures";
import { Feedback } from "@/app/components/support/Feedback";
import { Todo } from "@/app/components/todos/Todo";
import UserService, {
    userId,
    userService,
} from "@/app/components/users/ApiUser";
import { Idea } from "@/app/components/users/Ideas";
import { VersionData } from "@/app/components/versions/VersionData";
import { MentorshipRequest } from "@/app/pages/community/MentorshipRequest";
import { Participant } from '@/app/pages/management/ParticipantManagementPage';
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import CollaborationSettings from "../../../../pages/community/CollaborationSettings";
import { Communication } from "../../../communications/chat/Communication";
import CommunityContribution from "../../../crypto/CommunityContribution";
import { Whiteboard } from "../../../whiteboard/Whiteboard";
import { Document } from "../../stores/DocumentStore";
import { useUIManager } from "../../stores/UISlice";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";
interface Resource {
  id: string;
  name: string;
  description: string;
  color: string;
  // Add other properties specific to a resource
}

// Define the ResourceType enum if needed
enum ResourceType {
  Document,
  Image,
  Link,
  Other,
}
interface CollaborationState<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StrucuredMetadata<T, K> = StrucuredMetadata<T, K>> {
  sharedProjects: Project[];
  sharedMeetings: Meeting[];
  participants: Participants[]
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
  collaborationOptions: CollaborationOptions[];
  collaborationSettings: (typeof CollaborationSettings)[];
  selectedTask: Task<T, K> | null;
  isLoadingTaskDetails: boolean;
  error: string | null;
  whiteboards: Whiteboard[];
  isBrainstorming: boolean;
  brainstormingTopic: string;
  brainstormingIdeas: Idea[];
  documents: Document<T, K>[];
  comments: Feedback[];
  todos: Progress[];
  resources: Resource[];
  conflicts: Change[];
  securityMeasures: SecurityMeasure[];
  dataPrivacyRules: DataPrivacyRule[];
  trainingSessions: TrainingSession[];
  mentorshipRequests: MentorshipRequest[];
  selectedProject: (state: RootState, projectId: string) => Project | null;

  collaboration: {
    documentData: DocumentData<T, K>;
    uiManager: ReturnType<typeof useUIManager>;
    userService: UserService;
  };
  // Add other collaboration-related state properties here
}

const initialState: CollaborationState<Data, UniffiedMetaDataOptions> = {
  sharedProjects: [],
  sharedMeetings: [],
  tasks: [],
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
  brainstormingIdeas: [],
  documents: [],
  comments: [],
  todos: [],
  conflicts: [],
  securityMeasures: [],
  dataPrivacyRules: [],
  trainingSessions: [],
  mentorshipRequests: [],
  resources: [],
  collaboration: {
    documentData: {
      content: "",
      title: "",
      lastModifiedDate: { value: new Date(), isModified: false },
      id: "0",
      _id: "",
      topics: [],
      highlights: [],
      keywords: [],
      folders: [],
      options: {
        canComment: true,
        canView: true,
        canEdit: true,
      } as DocumentBuilderOptions,
      folderPath: "",
      visibility: "public",
      previousMetadata: undefined,
      currentMetadata: {},
      accessHistory: [],
      version: null,
      permissions: {} as DocumentPermissions,
      versionData: {} as VersionData,
    },
    uiManager: {} as ReturnType<typeof useUIManager>,
    userService: new UserService(),
  },
  selectedProject: (state: RootState, projectId: string): Project | null => {
    const project = state.collaborationManager.projects.find(
      (p) => p.id === projectId
    );
    return project || null;
  }
};
const handleCommunicationChange = (
  state: WritableDraft<CollaborationState<T, K, Meta>>,
  action: PayloadAction<WritableDraft<Communication>>
) => {
  switch (action.type) {
    case "add":
      state.communications.push(action.payload);
      break;
    case "update":
      const communicationToUpdate = state.communications.find(
        (c) => c.id === action.payload.id
      );
      if (communicationToUpdate) {
        Object.assign(communicationToUpdate, action.payload);
      }
      break;
    case "delete":
      state.communications = state.communications.filter(
        (c) => c.id !== action.payload.id
      );
      break;
    case "shareResource":
      type CommunicationResource = Communication & Resource;
      // Handle shareResource case separately
      const resourceToShare =
        action.payload as WritableDraft<CommunicationResource>;
      state.sharedResources.push(resourceToShare);
      break;
    case "updateResource":
      const resourceToUpdate = state.sharedResources.find(
        (r) => r.id === action.payload.id
      );
      if (resourceToUpdate) {
        Object.assign(resourceToUpdate, action.payload);
      }
      break;
    case "deleteResource":
      state.sharedResources = state.sharedResources.filter(
        (r) => r.id !== action.payload.id
      );
      break;
  }
};

export const shareDocumentAsync = createAsyncThunk(
  "collaboration/shareDocument",
  async (document: Document, { getState }) => {
    const state = getState() as CollaborationState;
    if (!state.documents.find((doc) => doc.id === document.id)) {
      state.documents.push(document);
    }
    // if document is private, check user permissions
    if (document.visibility === "private") {
      // check if current user has permission to view private document
      const user = await userService.fetchUserProfile(String(userId));
      if (!user.role.permissions.includes("view_private_documents")) {
        throw new Error(
          "User does not have permission to view private document"
        );
      }
      // Add comment to document
      const documentId = document.id.toString();
      const newComment: Comment = {
        id: documentId,
        content: "",
        resolved: false,
      };

      document.comments?.push(newComment);
      // Optionally update state with the added comment to the document
      // You may dispatch another action here to update the state with the added comment
    }
    // Handle logic to share the document
    console.log("Document shared:", document);
    // Optionally update state with the shared document
    // You may dispatch another action here to update the state with the shared document
  }
);

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

    participantData(state, action: PayloadAction<WritableDraft<Participant>>) {
      state.participants.push(action.payload);
    },

    shareMeeting(state, action: PayloadAction<WritableDraft<Meeting>>) {
      state.sharedMeetings.push(action.payload);
    },
    unshareMeeting(state, action: PayloadAction<number>) {
      state.sharedMeetings = state.sharedMeetings.filter(
        (meeting) => meeting.id !== action.payload
      );
    },
    scheduleMeeting(state, action: PayloadAction<WritableDraft<Meeting>>) {
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

    sendCommunication(
      state,
      action: PayloadAction<WritableDraft<Communication>>
    ) {
      state.communications.push(action.payload);
    },
    receiveCommunication(
      state,
      action: PayloadAction<WritableDraft<Communication>>
    ) {
      state.communications.push(action.payload);
    },

    handleResourceChange(
      state,
      action: PayloadAction<{
        resource: Resource;
        changeType: "update" | "delete";
      }>
    ) {
      const resourceIndex = state.resources.findIndex(
        (resource: WritableDraft<Resource>) =>
          resource.id === action.payload.resource.id
      );
      if (resourceIndex !== -1) {
        if (action.payload.changeType === "update") {
          state.resources[resourceIndex] = action.payload.resource;
          //  update resource in state
        }
      }
    },

    handleCryptoTransactionChange(
      state,
      action: PayloadAction<{
        transaction: CryptoTransaction;
        changeType: "update" | "delete";
      }>
    ) {
      const transactionIndex = state.cryptoTransactions.findIndex(
        (transaction: WritableDraft<CryptoTransaction>) => {
          return transaction.id === action.payload.transaction.id;
        }
      );
      if (transactionIndex !== -1) {
        if (action.payload.changeType === "update") {
          state.cryptoTransactions[transactionIndex] =
            action.payload.transaction;
        } else if (action.payload.changeType === "delete") {
          state.cryptoTransactions.splice(transactionIndex, 1);
        }
      }
    },

    shareResource(state, action: PayloadAction<Resource>) {
      state.sharedResources.push(action.payload);
    },
    unshareResource(state, action: PayloadAction<Resource>) {
      state.sharedResources = state.sharedResources.filter(
        (resource) => resource.id !== action.payload.id
      );
    },
    trackProjectProgress: (
      state: any,
      action: PayloadAction<{
        projectId: string;
        progress: Progress;
      }>
    ) => {
      const { projectId, progress } = action.payload;
      const projectIndex = state.projects.findIndex(
        (project: Project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const updatedProject = {
          ...state.projects[projectIndex],
          progress,
        };
        const updatedProjects = [...state.projects];
        updatedProjects[projectIndex] = updatedProject;
        return { ...state, projects: updatedProjects };
      }
      return state;
    },

    trackTaskProgress: (
      state: any,
      action: PayloadAction<{
        taskId: string;
        progress: Progress;
      }>
    ) => {
      const { taskId, progress } = action.payload;
      const taskIndex = state.tasks.findIndex(
        (task: Task) => task.id === taskId
      );
      if (taskIndex !== -1) {
        const updatedTask = { ...state.tasks[taskIndex], progress };
        const updatedTasks = [...state.tasks];
        updatedTasks[taskIndex] = updatedTask;
        return { ...state, tasks: updatedTasks };
      }
      return state;
    },

    updateTodo: (
      state: any,
      action: PayloadAction<{ id: string; changes: Partial<Todo> }>
    ) => {
      const { id, changes } = action.payload;
      const todoIndex = state.todos.findIndex((todo: Todo) => todo.id === id);
      if (todoIndex !== -1) {
        const updatedTodo = { ...state.todos[todoIndex], ...changes };
        const updatedTodos = [...state.todos];
        updatedTodos[todoIndex] = updatedTodo;
        return { ...state, todos: updatedTodos };
      }
      return state;
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

    mergeChanges: (state, action: PayloadAction<Change[]>) => {
      // Extract the changes from the action payload
      const changes = action.payload;

      // Check if there are changes
      if (changes) {
        // Iterate through each change
        changes.forEach((change) => {
          // Determine the type of change
          switch (change.type) {
            case "task":
              if (change.progress) {
                // Dispatch the action to track task progress
                trackTaskProgress({
                  taskId: change.payload.taskId,
                  progress: change.progress,
                });
              }
              break;
            case "milestone":
              // Dispatch the action to update milestone
              updateMilestone(change.payload);
              break;
            case "project":
              // Dispatch the action to track project progress
              trackProjectProgress({
                projectId: change.payload.id,
                progress: change.progress,
              });
              break;
            case "communication":
              // Iterate over each communication change
              change.payload.forEach(
                (communicationChange: WritableDraft<Communication>) => {
                  // Dispatch the action to handle communication changes
                  handleCommunicationChange(state, {
                    type: "communication",
                    payload: communicationChange,
                  });
                }
              );
              break;
            case "resource":
              // Dispatch the action to handle resource changes
              handleResourceChange(change.payload); // Change payload type
              break;
            case "cryptoTransaction":
              // Dispatch the action to handle crypto transaction changes
              handleCryptoTransactionChange({
                transaction: change.payload,
                changeType: change.payload as "update",
              });

              break;

            // Add more cases for other types of changes as needed
            default:
              throw new Error(`Unknown change type: ${change.type}`);
          }
        });
      }
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
    updateMilestone: (state: any, action: PayloadAction<Milestone>) => {
      const updatedMilestone = action.payload;
      const milestoneIndex = state.milestones.findIndex(
        (milestone: Milestone) => milestone.id === updatedMilestone.id
      );
      if (milestoneIndex !== -1) {
        const updatedMilestones = [...state.milestones];
        updatedMilestones[milestoneIndex] = updatedMilestone;
        return { ...state, milestones: updatedMilestones };
      }
      return state;
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

    resolveConflict(state, action: PayloadAction<{ conflictId: number }>) {
      // Logic to resolve a conflict
      const conflictIndex = state.conflicts.findIndex(
        (conflict) => conflict.id === action.payload.conflictId
      );
      if (conflictIndex !== -1) {
        // Assuming conflict resolution involves removing it from the state
        state.conflicts.splice(conflictIndex, 1);
      }
      return {
        ...state,
        conflicts: state.conflicts,
      };
    },

    escalateConflict(state, action: PayloadAction<{ conflictId: number }>) {
      // Logic to escalate a conflict
      const conflictIndex = state.conflicts.findIndex(
        (conflict) => conflict.id === action.payload.conflictId
      );
      if (conflictIndex !== -1) {
        // Assuming escalation involves updating a flag or status in the conflict object
        state.conflicts[conflictIndex].escalated = true;
      }
      return {
        ...state,
        conflicts: state.conflicts,
      };
    },

    implementSecurityMeasures(state, action: PayloadAction<SecurityMeasure[]>) {
      // Logic to implement security measures
      // Assuming security measures are added to the state
      state.securityMeasures.push(...action.payload);
      return {
        ...state,
        securityMeasures: state.securityMeasures,
      };
    },

    enforceDataPrivacy(
      state,
      action: PayloadAction<{ data: DataPrivacyRule }>
    ) {
      // Logic to enforce data privacy
      // Assuming data privacy rules are applied to the state
      state.dataPrivacyRules.push(action.payload.data);
      return {
        ...state,
        dataPrivacyRules: state.dataPrivacyRules,
      };
    },

    facilitateTraining(state, action: PayloadAction<TrainingSession>) {
      // Logic to facilitate training
      // Assuming training sessions are added to the state
      state.trainingSessions.push(action.payload);
      return {
        ...state,
        trainingSessions: state.trainingSessions,
      };
    },

    provideMentorship(state, action: PayloadAction<MentorshipRequest>) {
      // Logic to provide mentorship
      // Assuming mentorship requests are handled and stored in the state
      state.mentorshipRequests.push(action.payload);
      return {
        ...state,
        mentorshipRequests: state.mentorshipRequests,
      };
    },

    resolveConflicts: (state, action) => {
      // Logic to resolve conflicts between changes
      const conflictingChanges = action.payload.findConflictingChanges();
      // Merge changes
      state = mergeChanges(state, conflictingChanges);
      // Return updated state

      return state;
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
      });
    },
    analyzeData: (
      state,
      action: PayloadAction<{
        startDate: Date;
        endDate: Date;
      }>
    ): WritableDraft<CollaborationState<T, K, Meta>> => {
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
          (task: Task<T, K>) => task.status === StatusType.COMPLETED
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
        startDate?: string | Date;
        endDate: string;
      }>
    ): WritableDraft<CollaborationState<T, K, Meta>> => {
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
        comments: [...idea.comments, comment],
      };

      return {
        ...state,
        ideas: state.ideas.map((i) => {
          if (i.id === idea.id) {
            return updatedIdea;
          } else {
            return i;
          }
        }),
      };
    },
    configureCollaborationOptions: (
      state,
      action: PayloadAction<{
        options: WritableDraft<CollaborationOptions>[];
      }>
    ): WritableDraft<CollaborationState<T, K, Meta>> => {
      const { options } = action.payload;

      return {
        ...state,
        collaborationOptions: options,
      };
    },

    updateCollaborationSettings: (
      state,
      action: PayloadAction<{
        settings: (typeof CollaborationSettings)[];
      }>
    ): WritableDraft<CollaborationState<T, K, Meta>> => {
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
        tasks: state.tasks.map((t) => {
          if (t.id === task.id) {
            return task;
          } else {
            return t;
          }
        }),
      };
    },

    deleteTask: (state, action: PayloadAction<string>): void => {
      const taskId = action.payload;
      // Find the task in the state by its ID
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },

    getTaskDetails: (state, action: PayloadAction<string>): void => {
      const taskId = action.payload;

      // Find the task in the state by its ID
      const task = state.tasks.find((task) => task.id === taskId);

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

    listTasks: (state, action: PayloadAction<WritableDraft<Task[]>>): void => {
      state.tasks = action.payload;
    },

    startBrainstorming: (state, action: PayloadAction<string>): void => {
      const topic = action.payload;

      // Update state to indicate that brainstorming has started
      state.isBrainstorming = true;
      state.brainstormingTopic = topic;
    },

    endBrainstorming: (state, action: PayloadAction<void>): void => {
      // Reset brainstorming-related state
      state.isBrainstorming = false;
      state.brainstormingTopic = "";
      state.brainstormingIdeas = [];
    },

    createWhiteboard: (state, action: PayloadAction<Whiteboard>): void => {
      state.whiteboards.push(action.payload);
    },

    updateWhiteboard: (state, action: PayloadAction<Whiteboard>): void => {
      const updatedWhiteboard = action.payload;
      state.whiteboards = state.whiteboards.map((whiteboard: any) => {
        if (whiteboard.id === updatedWhiteboard.id) {
          return { ...whiteboard, ...updatedWhiteboard };
        }
        return whiteboard;
      });
    },

    deleteWhiteboard: (state, action: PayloadAction<string>): void => {
      state.whiteboards = state.whiteboards.filter(
        (whiteboard) => whiteboard.id !== action.payload
      );
    },

    // Get details of a whiteboard by ID
    getWhiteboardDetails: (state, action: PayloadAction<string>): void => {
      const whiteboardId = action.payload;
      // Find the whiteboard by ID
      const whiteboard = state.whiteboards.find(
        (board) => board.id === whiteboardId
      );
      if (whiteboard) {
        // Handle logic to fetch details of the whiteboard
        console.log(`Details of whiteboard ${whiteboardId}:`, whiteboard);
        // Update state with the fetched details if necessary
      } else {
        console.error(`Whiteboard with ID ${whiteboardId} not found`);
      }
    },

    // List all available whiteboards
    listWhiteboards: (state, action: PayloadAction<void>): void => {
      // Handle logic to list all whiteboards
      console.log("List of available whiteboards:", state.whiteboards);
      // Optionally update state with the list of whiteboards if needed
    },

    // Document actions

    // Add a comment to a document
    commentOnDocument: (
      state,
      action: PayloadAction<{ documentId: number; comment: string }>
    ): void => {
      const { documentId, comment } = action.payload;
      // Find the document by ID
      const document = state.documents.find((doc) => doc.id === documentId);
      if (document) {
        // Handle logic to add a comment to the document
        console.log(`Comment added to document ${documentId}:`, comment);
        // Optionally update state with the added comment
      } else {
        console.error(`Document with ID ${documentId} not found`);
      }
    },

    // Resolve a comment on a document
    resolveComment: (state, action: PayloadAction<string>): void => {
      const commentId = action.payload;
      // Find the comment by ID and resolve it
      const comment = state.comments.find(
        (comment) => comment.id === commentId
      );
      if (comment) {
        // Mark comment as resolved
        comment.resolved = true;
        console.log(`Comment ${commentId} resolved`);
      } else {
        console.error(`Comment with ID ${commentId} not found`);
      }

      // Handle logic to resolve the comment
      state.comments = state.comments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, resolved: true };
        }
        return comment;
      });
      console.log(`Comment resolved: ${commentId}`);
      // Optionally update state to mark the comment as resolved
    },
    // Update details of a document
    updateDocument: (
      state,
      action: PayloadAction<WritableDraft<Document>>
    ): void => {
      const updatedDocument = action.payload;
      // Find the document by ID
      const index = state.documents.findIndex(
        (doc) => doc.id === updatedDocument.id
      );
      if (index !== -1) {
        // Replace the document with the updated one
        state.documents[index] = updatedDocument;
        console.log(`Document updated:`, updatedDocument);
      } else {
        // Handle logic to update document details
        if (updatedDocument.id !== undefined) {
          state.documents = state.documents.map((doc) => {
            if (doc.id === updatedDocument.id) {
              return updatedDocument;
            }
            return doc;
          });
          console.log(
            `Document with ID ${updatedDocument.id} updated:`,
            updatedDocument
          );
        } else {
          console.error(`Document ID not found`);
        }
      }
    },

    // Delete a document
    deleteDocument: (state, action: PayloadAction<number>): void => {
      const documentId = action.payload;
      // Find the index of the document by ID
      const index = state.documents.findIndex((doc) => doc.id === documentId);
      if (index !== -1) {
        // Remove the document from the array
        state.documents.splice(index, 1);
        console.log(`Document deleted: ID ${documentId}`);
        // Optionally update state to remove the deleted document
      } else {
        console.error(`Document with ID ${documentId} not found`);
      }
    },

    // Get details of a document by ID
    getDocumentDetails: (state, action: PayloadAction<number>): void => {
      const documentId = action.payload;
      // Find the document by ID
      const document = state.documents.find((doc) => doc.id === documentId);
      if (document) {
        // Handle logic to fetch details of the document
        console.log(`Details of document ${documentId}:`, document);
        // Update state with the fetched details if necessary
      } else {
        console.error(`Document with ID ${documentId} not found`);
      }
    },

    // List all available documents
    listDocuments: (state, action: PayloadAction<void>): void => {
      // Handle logic to list all documents
      console.log("List of available documents:", state.documents);
      // Optionally update state with the list of documents if needed
    },

    selectedProject: (
      state,
      action: PayloadAction<(state: RootState,
        projectId: string) => Project | null>
    ): void => {
      state.selectedProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(shareDocumentAsync.fulfilled, (state, action) => {
      // Optionally update state with the shared document
    });
  },

  // Add other collaboration-related reducers here
});

export const {
  // Project sharing actions
  shareProject,
  unshareProject,
  inviteMembersToProject,
  removeMemberFromProject,
  // Meeting sharing actions
  selectedProject,
  shareMeeting,
  unshareMeeting,
  scheduleMeeting,
  cancelMeeting,
  // Task collaboration actions
  assignTask,
  unassignTask,
  markTaskAsCompleted,
  // Document collaboration actions

  // Communication actions
  sendCommunication,
  receiveCommunication,
  handleResourceChange,
  handleCryptoTransactionChange,

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

export const selectSelectedProject = (
  state: RootState,
  projectId: string
): Project | null => {
  const project = state.collaborationManager.sharedProjects.find(
    (p) => p.id === projectId
  );
  return project ? project : null;
};

// Add other selectors as needed

// Reducer
export default useCollaborationSlice.reducer;
export type { CollaborationState, Resource };
