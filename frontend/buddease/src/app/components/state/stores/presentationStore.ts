  // presentationStore.ts
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Presentation } from "../../documents/Presentation";
import { sanitizeData } from "../../security/SanitizationFunctions";
import { AssignBaseStore } from "../AssignBaseStore";
import { WritableDraft } from "../redux/ReducerGenerator";
import { useAssignTeamMemberStore } from "./AssignTeamMemberStore";
import { userManagerStore } from "./UserStore";

// Define the necessary types and interfaces
type PresentationStoreSubset = Pick<
  AssignBaseStore,
  "assignedItems" | "snapshotStore" | "events" | "assignUser"
  |"assignTeam"
  |"unassignUser"
  | "reassignUser"
  |"assignUsersToItems"
  | "unassignUsersFromItems"
  | "assignUsersToItems"
  | "unassignUsersFromItems"
  | "assignTaskToTeam"
  | "assignTodoToTeam"
  | "assignTodosToUsersOrTeams"
  | "assignTeamMemberToTeam"
  | "unassignTeamMemberFromItem"
  | "setDynamicNotificationMessage"
  | "reassignUsersToItems"
  | "assignUserToTodo"
  | "unassignUserFromTodo"
  | "reassignUserInTodo"
  | "assignUsersToTodos"
  | "unassignUsersFromTodos"
  | "reassignUsersInTodos"
  | "assignTeamToTodo"
  | "unassignTeamToTodo"
  | "reassignTeamToTodo"
  | "assignTeamToTodos"
  | "unassignTeamFromTodos"
  | "assignUserSuccess"
  | "assignUserFailure"
  | "assignMeetingToTeam"
  | "assignProjectToTeam"
  | "reassignTeamsInTodos"
  // | "assignTeamsToTodos"
  | "unassignTeamsFromTodos"
  | "reassignTeamsInTodos"
  | "assignTeamsToTodos"
  | "assignMeetingToTeam" // Added property
  | "assignNoteToTeam" // Added property
  | "assignFileToTeam" // Added property
  | "assignContactToTeam" // Added property
  | "assignEventToTeam" // Added property
  | "assignGoalToTeam" // Added property
  | "assignBookmarkToTeam" // Added property
  | "assignCalendarEventToTeam" // Added property
  | "assignBoardItemToTeam" // Added property
  | "assignBoardColumnToTeam" // Added property
  | "assignBoardListToTeam" // Added property
  | "assignBoardCardToTeam" // Added property
  | "assignBoardViewToTeam" // Added property
  | "assignBoardCommentToTeam" // Added property
  | "assignBoardActivityToTeam" // Added property
  | "assignBoardLabelToTeam" // Added property
  | "assignBoardMemberToTeam" // Added property
  | "assignBoardSettingToTeam" // Added property
  | "assignBoardPermissionToTeam" // Added property
  | "assignBoardNotificationToTeam" // Added property
  | "assignBoardIntegrationToTeam" // Added property
  | "assignBoardAutomationToTeam" // Added property
  | "assignBoardCustomFieldToTeam" // Added property
  >;

function getPropertyIfExists<T extends object, K extends keyof T>(
  obj: T,
  prop: K
): T[K] | undefined {
  return prop in obj ? obj[prop] : undefined;
}

// Use this hook to access methods and properties from AssignBaseStore specific to presentations
const presentationSubset = {
  ...useAssignTeamMemberStore(),
  ...userManagerStore(),

} as PresentationStoreSubset;

// Use type narrowing to access assignUser property
if ("assignUser" in presentationSubset) {
  presentationSubset.assignUser;
}
// Define the interface for the presentation store
export interface PresentationStore extends AssignBaseStore {
  presentations: Record<string, Presentation[]>;
  currentPresentation: Presentation | null;
  updatePresentationState: (
    newPresentations: WritableDraft<Record<string, Presentation[]>>
  ) => void;
  assignedItem: (itemId: string, item: WritableDraft<Presentation>) => void;
  assignedUsers: Record<string, string[]>; // Use ID as key and array of user IDs as value
  assignedItems: Record<string, string[]>; // Use ID as key and array of item IDs as value
  assignedTodos: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  assignedTasks: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  assignedTeams: Record<string, string[]>; // Use ID as key and array of todo IDs as value

  assignedProjects: Record<string, string[]>;
  assignedMeetings: Record<string, string[]>;
  assignedNotes: Record<string, string[]>;
  assignedGoals: Record<string, string[]>;
  assignedFiles: Record<string, string[]>;
  assignedEvents: Record<string, string[]>;
  assignedContacts: Record<string, string[]>;
  assignedCalendarEvents: Record<string, string[]>;
  assignedBookmarks: Record<string, string[]>;
  assignedBoardItems: Record<string, string[]>;
  assignedBoardColumns: Record<string, string[]>;
  assignedBoardLists: Record<string, string[]>;
  assignedBoardCards: Record<string, string[]>;
  assignedBoardViews: Record<string, string[]>;
  assignedBoardComments: Record<string, string[]>;
  assignedBoardActivities: Record<string, string[]>;
  assignedBoardLabels: Record<string, string[]>;
  assignedBoardMembers: Record<string, string[]>;
  assignedBoardSettings: Record<string, string[]>;
  assignedBoardPermissions: Record<string, string[]>;
  assignedBoardNotifications: Record<string, string[]>;
  assignedBoardIntegrations: Record<string, string[]>;
  assignedBoardAutomations: Record<string, string[]>;
  assignedBoardCustomFields: Record<string, string[]>;
}

// Define the presentation store function
const presentationStore = (): PresentationStore => {
  const [presentations, setPresentations] = useState<
    WritableDraft<Record<string, Presentation[]>>
  >({
    "": [],
  });

  const reassignTeamsInTodos = (
    todoIds: string[],
    oldTeamId: string,
    newTeamId: string
  ) => {
    const assignedTeams: Record<string, string[]> = {};
    // Reassign team in todo
    todoIds.forEach(todoId => {
      if (oldTeamId in assignedTeams[todoId]) {
        const index = assignedTeams[todoId].indexOf(oldTeamId);
        if (index > -1) {
          assignedTeams[todoId][index] = newTeamId;
        }
        if (assignedTeams[todoId].length === 1) {
          delete assignedTeams[todoId];
        }
      }
    });
  };
  

  const assignProjectToTeam = (
    projectId: string,
    teamId: string
  ): Promise<AxiosResponse< any, any>> => {
    return new Promise<AxiosResponse<any, any>>((resolve) => {
      if (!(projectId in assignedProjects)) {
        assignedProjects[projectId] = [];
      }
      assignedProjects[projectId].push(teamId);
    resolve({
        status: 200,
        statusText: 'OK',
        headers: {} as typeof headersConfig,
        config: {} as InternalAxiosRequestConfig<any>,
        data: { message: "Team assigned to project" },
    })})
  };
  
    const assignedItem: (
      itemId: string,
      item: WritableDraft<Presentation>
    ) => void = (itemId, item) => {
      setPresentations((draft: WritableDraft<Record<string, Presentation[]>>) => {
        if (!draft[itemId]) {
          draft[itemId] = [];
        }
        draft[itemId].push(item);
        return draft;
      });
    };
    const assignedUsers: Record<string, string[]> = {};
    const assignedTodos: Record<string, string[]> = {};
    const assignedTasks: Record<string, string[]> = {};
    const assignedTeams: Record<string, string[]> = {};
    const assignedProjects: Record<string, string[]> = {};
    const assignedMeetings: Record<string, string[]> = {};
    const assignedNotes: Record<string, string[]> = {};
    const assignedGoals: Record<string, string[]> = {};
    const assignedFiles: Record<string, string[]> = {};
    const assignedEvents: Record<string, string[]> = {};
    const assignedContacts: Record<string, string[]> = {};
    const assignedCalendarEvents: Record<string, string[]> = {};

    const assignedBookmarks: Record<string, string[]> = {};
    const assignedBoardItems: Record<string, string[]> = {};
    const assignedBoardColumns: Record<string, string[]> = {};
    const assignedBoardLists: Record<string, string[]> = {};
    const assignedBoardCards: Record<string, string[]> = {};
    const assignedBoardViews: Record<string, string[]> = {};
    const assignedBoardComments: Record<string, string[]> = {};
    const assignedBoardActivities: Record<string, string[]> = {};
    const assignedBoardLabels: Record<string, string[]> = {};
    const assignedBoardMembers: Record<string, string[]> = {};
    const assignedBoardSettings: Record<string, string[]> = {};
    const assignedBoardPermissions: Record<string, string[]> = {};
    const assignedBoardNotifications: Record<string, string[]> = {};
    const assignedBoardIntegrations: Record<string, string[]> = {};
    const assignedBoardAutomations: Record<string, string[]> = {};
    const assignedBoardCustomFields: Record<string, string[]> = {};
 
    const updatePresentationState = (
      newPresentations: WritableDraft<Record<string, Presentation[]>>
    ) => {
      const sanitizedPresentations = sanitizeData(
        JSON.stringify(newPresentations)
      );
      setPresentations(JSON.parse(sanitizedPresentations));
    };

    const assignBaseStore: AssignBaseStore = {} as AssignBaseStore;
    const store = makeAutoObservable({
      presentations,
      currentPresentation: null,
      updatePresentationState,
      assignedItem,
      assignedProjects,
      assignedMeetings,
      assignedNotes,
      assignedGoals,
      assignedFiles,
      assignedEvents,
      assignedContacts,
      assignedCalendarEvents,
      assignedBookmarks,
      assignedBoardItems,
      assignedBoardColumns,
      assignedBoardLists,
      assignedBoardCards,
      assignedBoardViews,
      assignedBoardComments,
      assignedBoardActivities,
      assignedBoardLabels,
      assignedBoardMembers,
      assignedBoardSettings,
      assignedBoardPermissions,
      assignedBoardNotifications,
      assignedBoardIntegrations,
      assignedBoardAutomations,
      assignedBoardCustomFields,
      ...assignBaseStore,
      ...presentationSubset,
      assignBaseStore: assignBaseStore,

      assignedItems: presentationSubset.assignedItems,
      assignItem: presentationSubset.assignedItems,

      reassignTeamsInTodos:  presentationSubset.reassignTeamsInTodos,
      assignProjectToTeam: presentationSubset.assignProjectToTeam,
      assignMeetingToTeam: presentationSubset.assignMeetingToTeam,
      assignNoteToTeam: presentationSubset.assignNoteToTeam,
      assignFileToTeam: presentationSubset.assignFileToTeam,
      assignContactToTeam: presentationSubset.assignContactToTeam,
      assignEventToTeam: presentationSubset.assignEventToTeam,
      assignGoalToTeam: presentationSubset.assignGoalToTeam,
      assignBookmarkToTeam: presentationSubset.assignBookmarkToTeam,
      assignCalendarEventToTeam: presentationSubset.assignCalendarEventToTeam,
      assignBoardItemToTeam: presentationSubset.assignBoardItemToTeam,
      assignBoardColumnToTeam: presentationSubset.assignBoardColumnToTeam,
      assignBoardListToTeam: presentationSubset.assignBoardListToTeam,
      assignBoardCardToTeam: presentationSubset.assignBoardCardToTeam,
      assignBoardViewToTeam: presentationSubset.assignBoardViewToTeam,
      assignBoardCommentToTeam: presentationSubset.assignBoardCommentToTeam,
      assignBoardActivityToTeam: presentationSubset.assignBoardActivityToTeam,
      assignBoardLabelToTeam: presentationSubset.assignBoardLabelToTeam,
      assignBoardMemberToTeam: presentationSubset.assignBoardMemberToTeam,
      assignBoardSettingToTeam: presentationSubset.assignBoardSettingToTeam,
      assignBoardPermissionToTeam: presentationSubset.assignBoardPermissionToTeam,
      assignBoardNotificationToTeam: presentationSubset.assignBoardNotificationToTeam,
      assignBoardIntegrationToTeam: presentationSubset.assignBoardIntegrationToTeam,
      assignBoardAutomationToTeam: presentationSubset.assignBoardAutomationToTeam,
      assignBoardCustomFieldToTeam: presentationSubset.assignBoardCustomFieldToTeam,
      assignUser: getPropertyIfExists(presentationSubset, "assignUser"),
      assignTeam: getPropertyIfExists(presentationSubset, "assignTeam"),
      unassignUser: getPropertyIfExists(presentationSubset, "unassignUser"),
      reassignUser: getPropertyIfExists(presentationSubset, "reassignUser"),
      assignUsersToItems: getPropertyIfExists(presentationSubset, "assignUsersToItems"),
      unassignUsersFromItems: getPropertyIfExists(presentationSubset, "unassignUsersFromItems"),
      assignTaskToTeam: getPropertyIfExists(presentationSubset, "assignTaskToTeam"),
      assignTodoToTeam: getPropertyIfExists(presentationSubset, "assignTodoToTeam"),
      assignTodosToUsersOrTeams: getPropertyIfExists(presentationSubset, "assignTodosToUsersOrTeams"),
      assignTeamMemberToTeam: getPropertyIfExists(presentationSubset, "assignTeamMemberToTeam"),
      unassignTeamMemberFromItem: getPropertyIfExists(presentationSubset, "unassignTeamMemberFromItem"),
      setDynamicNotificationMessage: getPropertyIfExists(presentationSubset, "setDynamicNotificationMessage"),
      reassignUsersToItems: getPropertyIfExists(presentationSubset, "reassignUsersToItems"),
      assignUserToTodo: getPropertyIfExists(presentationSubset, "assignUserToTodo"),
      unassignUserFromTodo: getPropertyIfExists(presentationSubset, "unassignUserFromTodo"),
      reassignUserInTodo: getPropertyIfExists(presentationSubset, "reassignUserInTodo"),
      assignUsersToTodos: getPropertyIfExists(presentationSubset, "assignUsersToTodos"),
      unassignUsersFromTodos: getPropertyIfExists(presentationSubset, "unassignUsersFromTodos"),
      reassignUsersInTodos: getPropertyIfExists(presentationSubset, "reassignUsersInTodos"),
      assignTeamToTodo: getPropertyIfExists(presentationSubset, "assignTeamToTodo"),
      unassignTeamToTodo: getPropertyIfExists(presentationSubset, "unassignTeamToTodo"),
      reassignTeamToTodo: getPropertyIfExists(presentationSubset, "reassignTeamToTodo"),
      assignTeamToTodos: getPropertyIfExists(presentationSubset, "assignTeamToTodos"),
      unassignTeamFromTodos: getPropertyIfExists(presentationSubset, "unassignTeamFromTodos"),
      assignUserSuccess: getPropertyIfExists(presentationSubset, "assignUserSuccess"),
      assignUserFailure: getPropertyIfExists(presentationSubset, "assignUserFailure"),
    
    })
  
return store
}
export { presentationStore };

