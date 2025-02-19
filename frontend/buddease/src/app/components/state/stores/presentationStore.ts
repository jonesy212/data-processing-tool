import { ExtendedCalendarEvent } from './../../calendar/CalendarEventTimingOptimization';
import { Data } from '@/app/components/models/data/Data';
// presentationStore.ts
import { headersConfig } from "@/app/components/shared/SharedHeaders";
import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Presentation } from "../../documents/Presentation";
import { sanitizeData } from "../../security/SanitizationFunctions";
import { AssignBaseStore } from "../AssignBaseStore";
import { WritableDraft } from "../redux/ReducerGenerator";
import { AssignTaskStore } from "./AssignTaskStore";
import { useAssignTeamMemberStore } from "./AssignTeamMemberStore";
import { userManagerStore } from "./UserStore";

// Define the necessary types and interfaces
type PresentationStoreSubset = Pick<
  AssignBaseStore | AssignTaskStore,
  | "assignedItems"
  | "snapshotStore"
  | "events"
  | "assignUser"
  | "assignTeam"
  | "unassignUser"
  | "reassignUser"
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
  | "unassignTeamsFromTodos"
  | "assignTeamsToTodos"
  | "assignNoteToTeam"
  | "assignFileToTeam"
  | "assignContactToTeam"
  | "assignEventToTeam"
  | "assignGoalToTeam"
  | "assignBookmarkToTeam"
  | "assignCalendarEventToTeam"
  | "assignBoardItemToTeam"
  | "assignBoardColumnToTeam"
  | "assignBoardListToTeam"
  | "assignBoardCardToTeam"
  | "assignBoardViewToTeam"
  | "assignBoardCommentToTeam"
  | "assignBoardActivityToTeam"
  | "assignBoardLabelToTeam"
  | "assignBoardMemberToTeam"
  | "assignBoardSettingToTeam"
  | "assignBoardPermissionToTeam"
  | "assignBoardNotificationToTeam"
  | "assignBoardIntegrationToTeam"
  | "assignBoardAutomationToTeam"
  | "assignBoardCustomFieldToTeam"
>;

function getPropertyIfExists<T extends object, K extends keyof T>(
  obj: T,
  prop: K
): T[K] | undefined {
  return obj[prop];
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
  assignedItems: Record<string, ExtendedCalendarEvent[]> // Use ID as key and array of item IDs as value
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
    todoIds.forEach((todoId) => {
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
  ): Promise<AxiosResponse<any, any>> => {
    return new Promise<AxiosResponse<any, any>>((resolve) => {
      if (!(projectId in assignedProjects)) {
        assignedProjects[projectId] = [];
      }
      assignedProjects[projectId].push(teamId);
      resolve({
        status: 200,
        statusText: "OK",
        headers: {} as typeof headersConfig,
        config: {} as InternalAxiosRequestConfig<any>,
        data: { message: "Team assigned to project" },
      });
    });
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

    assignedItems: presentationSubset.assignedItems || {},
    assignItem: presentationSubset.assignedItems || {},

    reassignTeamsInTodos: presentationSubset.reassignTeamsInTodos || (() => {}),
    assignProjectToTeam:
      presentationSubset.assignProjectToTeam || (() => Promise.resolve()),
    assignMeetingToTeam:
      presentationSubset.assignMeetingToTeam || (() => Promise.resolve()),
    assignNoteToTeam:
      presentationSubset.assignNoteToTeam || (() => Promise.resolve()),
    assignFileToTeam:
      presentationSubset.assignFileToTeam || (() => Promise.resolve()),
    assignContactToTeam:
      presentationSubset.assignContactToTeam || (() => Promise.resolve()),
    assignEventToTeam:
      presentationSubset.assignEventToTeam || (() => Promise.resolve()),
    assignGoalToTeam:
      presentationSubset.assignGoalToTeam || (() => Promise.resolve()),
    assignBookmarkToTeam:
      presentationSubset.assignBookmarkToTeam || (() => Promise.resolve()),
    assignCalendarEventToTeam:
      presentationSubset.assignCalendarEventToTeam || (() => Promise.resolve()),
    assignBoardItemToTeam:
      presentationSubset.assignBoardItemToTeam || (() => Promise.resolve()),
    assignBoardColumnToTeam:
      presentationSubset.assignBoardColumnToTeam || (() => Promise.resolve()),
    assignBoardListToTeam:
      presentationSubset.assignBoardListToTeam || (() => Promise.resolve()),
    assignBoardCardToTeam:
      presentationSubset.assignBoardCardToTeam || (() => Promise.resolve()),
    assignBoardViewToTeam:
      presentationSubset.assignBoardViewToTeam || (() => Promise.resolve()),
    assignBoardCommentToTeam:
      presentationSubset.assignBoardCommentToTeam || (() => Promise.resolve()),
    assignBoardActivityToTeam:
      presentationSubset.assignBoardActivityToTeam || (() => Promise.resolve()),
    assignBoardLabelToTeam:
      presentationSubset.assignBoardLabelToTeam || (() => Promise.resolve()),
    assignBoardMemberToTeam:
      presentationSubset.assignBoardMemberToTeam || (() => Promise.resolve()),
    assignBoardSettingToTeam:
      presentationSubset.assignBoardSettingToTeam || (() => Promise.resolve()),
    assignBoardPermissionToTeam:
      presentationSubset.assignBoardPermissionToTeam ||
      (() => Promise.resolve()),
    assignBoardNotificationToTeam:
      presentationSubset.assignBoardNotificationToTeam ||
      (() => Promise.resolve()),
    assignBoardIntegrationToTeam:
      presentationSubset.assignBoardIntegrationToTeam ||
      (() => Promise.resolve()),
    assignBoardAutomationToTeam:
      presentationSubset.assignBoardAutomationToTeam ||
      (() => Promise.resolve()),
    assignBoardCustomFieldToTeam:
      presentationSubset.assignBoardCustomFieldToTeam ||
      (() => Promise.resolve()),

    assignUser: presentationSubset.assignUser || {},
    assignTeam: presentationSubset.assignTeam || {},
    unassignUser: presentationSubset.unassignUser || {},
    reassignUser: presentationSubset.reassignUser || {},
    assignUsersToItems: presentationSubset.assignUsersToItems || (() => {}),
    unassignUsersFromItems:
      presentationSubset.unassignUsersFromItems || (() => {}),
    assignTaskToTeam:
      presentationSubset.assignTaskToTeam || (() => Promise.resolve()),
    assignTodoToTeam:
      presentationSubset.assignTodoToTeam || (() => Promise.resolve()),
    assignTodosToUsersOrTeams:
      presentationSubset.assignTodosToUsersOrTeams || (() => {}),
    assignTeamMemberToTeam:
      presentationSubset.assignTeamMemberToTeam || (() => Promise.resolve()),
    unassignTeamMemberFromItem:
      presentationSubset.unassignTeamMemberFromItem || (() => {}),
    setDynamicNotificationMessage:
      presentationSubset.setDynamicNotificationMessage || (() => {}),
    reassignUsersToItems: presentationSubset.reassignUsersToItems || (() => {}),
    assignUserToTodo:
      presentationSubset.assignUserToTodo || (() => Promise.resolve()),
    unassignUserFromTodo:
      presentationSubset.unassignUserFromTodo || (() => Promise.resolve()),
    reassignUserInTodo:
      presentationSubset.reassignUserInTodo || (() => Promise.resolve()),
    assignUsersToTodos:
      presentationSubset.assignUsersToTodos || (() => Promise.resolve()),
    unassignUsersFromTodos:
      presentationSubset.unassignUsersFromTodos || (() => Promise.resolve()),
    reassignUsersInTodos:
      presentationSubset.reassignUsersInTodos || (() => Promise.resolve()),
    assignTeamToTodo:
      presentationSubset.assignTeamToTodo || (() => Promise.resolve()),
    unassignTeamToTodo:
      presentationSubset.unassignTeamToTodo || (() => Promise.resolve()),
    reassignTeamToTodo:
      presentationSubset.reassignTeamToTodo || (() => Promise.resolve()),
    assignTeamToTodos:
      presentationSubset.assignTeamToTodos || (() => Promise.resolve()),
    unassignTeamFromTodos:
      presentationSubset.unassignTeamFromTodos || (() => Promise.resolve()),
    assignUserSuccess: presentationSubset.assignUserSuccess || (() => {}),
    assignUserFailure: presentationSubset.assignUserFailure || (() => {}),
  });

  return store;
};
export { presentationStore };
