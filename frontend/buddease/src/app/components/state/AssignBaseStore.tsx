// AssignBaseStore.tsx
import { Config } from "@/app/api/ApiConfig";
import { HeadersConfig } from "@/app/api/headers/HeadersConfig";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { makeAutoObservable } from "mobx";
import teamApiService from "../../api/TeamApi";
import CalendarEventTimingOptimization, { ExtendedCalendarEvent } from "../calendar/CalendarEventTimingOptimization";
import { AssignBaseStoreLogger } from "../logging/Logger";
import { Data } from "../models/data/Data";
import { Team } from "../models/teams/Team";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";
import { NotificationType, NotificationTypeEnum, useNotification } from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { Todo, UserAssignee } from "../todos/Todo";
import { todoService } from "../todos/TodoService";
import { User } from "../users/User";
import { ReassignEventResponse } from "./stores/AssignEventStore";
import { useAssignTeamMemberStore } from "./stores/AssignTeamMemberStore";
import { AuthStore } from "./stores/AuthStore";
import { PresentationStore, presentationStore } from "./stores/presentationStore";

const { notify } = useNotification();

interface ExtendedTodo extends Todo {
  // Add additional properties specific to ExtendedTodo if needed
  additionalField: string;
  // ...
}

export interface AssignBaseStore {
  assignedUsers: Record<string, string[]>; // Use ID as key and array of user IDs as value
  assignedItems: Record<string, ExtendedCalendarEvent[]>; // Use ID as key and array of item IDs as value
  assignMeetingToTeam: (
    meetingId: string,
    teamId: string
  ) => Promise<AxiosResponse>;
  
  assignProjectToTeam: (
    projectId: string,
    teamId: string
  ) => Promise<AxiosResponse>;

  connectResponsesToTodos: (
    todoIds: string[],
    assignees: string[],
    todos: ExtendedTodo[], 
    eventId: string,
    responses: ReassignEventResponse[] 
    ) => void;


  reassignTeamsInTodos: (
    todoIds: string[],
    oldTeamId: string,
    newTeamId: string
  ) => Promise<AxiosResponse>;

  assignedTodos: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  assignedTasks: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  assignedTeams: Record<string, string[]>; // Use ID as key and array of todo IDs as value
  events: Record<string, CalendarEventTimingOptimization[] | ExtendedCalendarEvent[]>

  assignItem: Record<string, string[] | ExtendedCalendarEvent[]>;
  assignUser: Record<string, string[]>;
  assignTeam: Record<string, string[]>;
  unassignUser: Record<string, string[]>;
  reassignUser: Record<string, ReassignEventResponse[]>;
  assignUsersToItems: Record<string, string[]>;
  unassignUsersFromItems: Record<string, string[]>;

  assignTaskToTeam: (taskId: string, userId: string) => Promise<void>;
  assignTodoToTeam: (todoId: string, teamId: string) => Promise<void>;

  assignNote: Record<string, string[]>;
  assignTodosToUsersOrTeams: (
    todoIds: string[],
    assignees: string[]
  ) => Promise<void>;

  assignTeamMemberToTeam: (teamId: string, userId: string) => void;
  unassignTeamMemberFromItem: (itemId: string, userId: string) => void;

  setDynamicNotificationMessage: (message: Message, type: NotificationType) => void;
  snapshotStore: SnapshotStore<Snapshot<Data, Data>>;

  reassignUsersToItems: Record<string, string[]>;

  assignUserToTodo: (todoId: string, userId: string) => void;
  unassignUserFromTodo: (todoId: string, userId: string) => void;
  reassignUserInTodo: (
    todoId: string,
    oldUserId: string,
    newUserId: string
  ) => void;

  assignUsersToTodos: (todoIds: string[], userId: string) => void;
  unassignUsersFromTodos: (todoIds: string[], userId: string) => void;
  reassignUsersInTodos: (
    todoIds: string[],
    oldUserId: string,
    newUserId: string
  ) => void;


  getAuthStore: () => AuthStore;

  assignTeamToTodo: (todoId: string, teamId: string) => void;
  unassignTeamToTodo: (todoId: string, teamId: string) => void;
  reassignTeamToTodo: (
    todoId: string,
    oldTeamId: string,
    newTeamId: string
  ) => void;

  assignTeamToTodos: (todoIds: Team[], teamId: string) => void;
  
  unassignTeamFromTodos: (todoIds: string[], teamId: string) => void;
  reassignTeamToTodos: (
    teamIds: string[],
    teamId: string,
    newTeamId: string
  ) => void;
  
  
  
  // Success and Failure methods
  assignUserSuccess: (message: string) => void;
  assignUserFailure: (error: string) => void;
  
  assignTeamsToTodos: Record<string, string[]>
  unassignTeamsFromTodos: Record<string, string[]>;


  assignNoteToTeam: Record<string, string[]>;
  unassignNoteFromTeam: (noteId: string, teamId: string) => Promise<void>;


  assignFileToTeam: Record<string, string[]>;
  assignContactToTeam: Record<string, string[]>;
  assignEventToTeam: Record<string, string[]>;
  assignGoalToTeam: Record<string, string[]>;
  assignBookmarkToTeam: Record<string, string[]>;
  assignCalendarEventToTeam: Record<string, string[]>;
  assignBoardItemToTeam: Record<string, string[]>;
  assignBoardColumnToTeam: Record<string, string[]>;
  assignBoardListToTeam: Record<string, string[]>,
  assignBoardCardToTeam: Record<string, string[]>,
  assignBoardViewToTeam: Record<string, string[]>,
  assignBoardCommentToTeam: Record<string, string[]>,
  assignBoardActivityToTeam: Record<string, string[]>,
  assignBoardLabelToTeam: Record<string, string[]>,
  assignBoardMemberToTeam: Record<string, string[]>,
  assignBoardSettingToTeam: Record<string, string[]>,
  assignBoardPermissionToTeam: Record<string, string[]>,
  assignBoardNotificationToTeam: Record<string, string[]>,
  assignBoardIntegrationToTeam: Record<string, string[]>,
  assignBoardAutomationToTeam: Record<string, string[]>,
  assignBoardCustomFieldToTeam: Record<string, string[]>,


  setAssignedTaskStore: (store: SnapshotStore<Snapshot<Data, Data>>) => void;
  // Add more methods or properties as needed
}

const useAssignBaseStore = (): AssignBaseStore => {
  const assignedUsers: Record<string, string[]> = {};
  const assignedItems: Record<string, ExtendedCalendarEvent[]> = {};
  const assignedTodos: Record<string, string[]> = {};
  const assignedTeams: Record<string, string[]> = {};
  const assignTeamsToTodos: Record<string, string[]> = {};
  const assignedTasks: Record<string, string[]> = {};
  const events: Record<string, ExtendedCalendarEvent[]> = {};

  //todo set up:
  const assignedProjects: Record<string, string[]> = {};
  const assignedMeetings: Record<string, string[]> = {};
  const assignNote: Record<string, string[]> = {};

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

  const assignItem = {} as Record<string, string[] | ExtendedCalendarEvent[]>

  const assignUser = {} as Record<string, string[]>;

  const assignTeam = {} as Record<string, string[]>;

  const unassignUser = {} as Record<string, string[]>;

  const reassignUser = {} as Record<string, ReassignEventResponse[]>;

  const assignUsersToItems = {} as Record<string, string[]>;

  const unassignUsersFromItems = {} as Record<string, string[]>;

  const reassignUsersToItems = {} as Record<string, string[]>;

  const unassignTeamsFromTodos = {} as Record<string, string[]>;

  const assignFileToTeam = {} as Record<string, string[]>


  const connectResponsesToTodos = (
    todoIds: string[],
    assignees: string[],
    todos: ExtendedTodo[],
    eventId: string,
    responses: ReassignEventResponse[]
  ) => {
    const responseMap: Record<string, ReassignEventResponse> = {};
    for (const response of responses) {
      responseMap[response.eventId] = response;
    }
    for (const todo of todos) {
      if (responseMap[todo.id]) {
        todo.assignee = responseMap[todo.id].assignee as unknown as User;
      }
    }
  };


  const todosStore: { [key: string]: Todo } = {};
  const usersStore: { [key: string]: UserAssignee } = {}; // Example user store
  
  const assignUserToTodo = (todoId: string, userId: string) => {
    // Check if the todo exists in the todosStore
    const todo = todosStore[todoId];
    if (!todo) {
      throw new Error("Todo not found");
    }
  
    // Check if the user exists in the usersStore
    const user = usersStore[userId];
    if (!user) {
      throw new Error("User not found");
    }
  
    // Check if the user is not already assigned to the todo
    if (!todo.assignedUsers.includes(userId)) {
      todo.assignedUsers.push(userId);
      
      // Update assigneeId and assignee if there's only one assignee
      if (todo.assignedUsers.length === 1) {
        todo.assigneeId = userId;
        todo.assignee = user;
      }
    }
  
    // Additional logic when assigning a user to a todo
  
    // Send Notification
    AssignBaseStoreLogger.sendAssignmentNotification(String(user), String(todo));
  
    // Log Activity
    AssignBaseStoreLogger.logAssignmentActivity(String(user), String(todo));
  
    // Update Todo Store
    todosStore[todoId] = todo;
  
    // Save changes (if applicable)
    todo.save().then(() => {
      console.log(`User ${userId} assigned to Todo ${todoId}`);
    }).catch(error => {
      console.error(`Error saving Todo ${todoId}:`, error);
    });
  };
  

  const unassignUserFromTodo = (todoId: string, userId: string) => {
    // Check if the todoId exists in the assignedUsers
    if (assignedUsers[todoId]) {
      // Remove the user from the assignedUsers for the given todoId
      assignedUsers[todoId] = assignedUsers[todoId].filter(
        (id) => id !== userId
      );

      // Remove the todoId entry if there are no more assigned users
      if (assignedUsers[todoId].length === 0) {
        delete assignedUsers[todoId];
      }
    }
  };

  const reassignUserInTodo = (
    todoId: string,
    oldUserId: string,
    newUserId: string
  ) => {
    // Unassign old user and assign new user to the todo
    unassignUserFromTodo(todoId, oldUserId);
    assignUserToTodo(todoId, newUserId);
  };

  const assignUsersToTodos = (todoIds: string[], userId: string) => {
    todoIds.forEach((todoId) => {
      assignUserToTodo(todoId, userId);
    });
    // TODO: Implement any additional logic needed when assigning a user to multiple todos
  };

  const unassignUsersFromTodos = (todoIds: string[], userId: string) => {
    todoIds.forEach((todoId) => {
      unassignUserFromTodo(todoId, userId);
    });
    // TODO: Implement any additional logic needed when unassigning a user from multiple todos
  };

  const reassignUsersInTodos = (
    todoIds: string[],
    oldUserId: string,
    newUserId: string
  ) => {
    todoIds.forEach((todoId) => {
      // Unassign old user and assign new user to each todo
      unassignUserFromTodo(todoId, oldUserId);
      assignUserToTodo(todoId, newUserId);
    });
    // TODO: Implement any additional logic needed when reassigning a user from old user to new user for multiple todos
  };

  // Success and Failure methods
  const assignUserSuccess = () => {
    console.log("Assign user success!");
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
      NotificationTypeEnum.AssignmentOperationSuccess
    );
  };

  const assignUserFailure = (error: string) => {
    console.error("Assign user failure:", error);
    // You can add additional error handling or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.User.ASSIGN_USER_FAILURE,
      NotificationTypeEnum.Error
    );
  };



  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string | Message, type: NotificationType) => {
    setDynamicNotificationMessage(message, type);
  };

  const assignTaskToTeam = async (taskId: string, teamId: string) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Perform the task assignment logic here
      // For example, update the assignedTasks record
      if (!assignedTasks[taskId]) {
        assignedTasks[taskId] = [teamId];
      } else {
        assignedTasks[taskId].push(teamId);
      }

      // TODO: Implement any additional logic needed when assigning a task to a team

      // Resolve the promise after completing the operation
      resolve();
    });
  };

  const assignTodoToUser = async (user: User, todo: Todo) => {
    // check if user has an ID
    if (!user._id) {
      throw new Error("User must have an ID");
    }
    // Add user to todo's assignedUsers
    if (user._id) {
      todo.assignedUsers.push(user._id);
      // Save updates to todo
      await todo.save();
    }
  };

  const assignTodoToTeam = async (todoId: string, teamId: string) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Perform the todo assignment logic here
      // For example, update the assignedTodos record
      if (!assignedTodos[todoId]) {
        assignedTodos[todoId] = [teamId];
      } else {
        assignedTodos[todoId].push(teamId);
      }

      // TODO: Implement any additional logic needed when assigning a todo to a team

      // Resolve the promise after completing the operation
      resolve();
    });
  };

  const assignTeamMemberToTeam = (itemId: string, userId: string) => {
    // Perform the team member assignment logic here
    // For example, update the assignedTeams record
    if (!assignedTeams[itemId]) {
      assignedTeams[itemId] = [userId];
    } else {
      assignedTeams[itemId].push(userId);
    }

    // TODO: Implement any additional logic needed when assigning a team member to an item
  };



  const unassignTeamMemberFromItem = (itemId: string, userId: string) => {
    // Check if the itemId exists in the assignedTeams
    if (assignedTeams[itemId]) {
      // Remove the team member from the assignedTeams for the given itemId
      assignedTeams[itemId] = assignedTeams[itemId].filter(
        (id) => id !== userId
      );

      // Remove the itemId entry if there are no more assigned team members
      if (assignedTeams[itemId].length === 0) {
        delete assignedTeams[itemId];
      }
    }
    // TODO: Implement any additional logic needed when unassigning a team member from an item
  };

  

  const assignTeamToTodo = async (todoId: string, teamId: string) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Perform the todo assignment logic here
      // For example, update the assignedTodos record
      if (!assignedTodos[todoId]) {
        assignedTodos[todoId] = [teamId];
      } else {
        assignedTodos[todoId].push(teamId);
      }

      // TODO: Implement any additional logic needed when assigning a team to a todo

      // Resolve the promise after completing the operation
      resolve();
    });
  };

  const assignTodosToUsersOrTeams = async (
    todoIds: string[],
    assignees: string[]
  ) => {
    for (let i = 0; i < todoIds.length; i++) {
      const todoId = todoIds[i];
      for (let j = 0; j < assignees.length; j++) {
        const assignee = assignees[j];
        if (assignee.includes("user-")) {
          // Assign todo to user
          await assignTodoToUser(
            assignee as unknown as User,
            todoId as unknown as Todo
          );
        } else {
          // Assign todo to team
          await assignTodoToTeam(todoId, assignee);
        }
      }
    }
  };

  async function unassignTeamFromTodo(
    teamId: string,
    todoId: string
  ): Promise<void> {
    try {
      // Make a request to the API to unassign the team from the todo
      await todoService.unassignTodoFromTeam(todoId, teamId);

      console.log(`Successfully unassigned team ${teamId} from todo ${todoId}`);
    } catch (error) {
      console.error(
        `Failed to unassign team ${teamId} from todo ${todoId}:`,
        error
      );
      // Handle error
      throw new Error(`Failed to unassign team ${teamId} from todo ${todoId}`);
    }
  }
  const reassignTeamsInTodos = async (
    todoIds: string[],
    oldTeamId: string,
    newTeamId: string
  ): Promise<AxiosResponse<any, any>> => {
    for (let todoId of todoIds) {
      // Fetch the team object by its ID
      const teamResponse: AxiosResponse<Team[]> =
        await teamApiService.getTeamById(todoId);

      // Extract the team array from the response data
      const teams: Team[] = teamResponse.data;

      if (!teams || teams.length === 0) continue; // Skip if no teams are found

      // Unassign old team and assign new team for each team
      for (const team of teams) {
        team.assignedTeams = team.assignedTeams.filter(
          (id: string) => id !== oldTeamId
        );
        team.assignedTeams.push(newTeamId);
        // await team.save();

        // Unassign old team and assign new team for the current todo
        await unassignTeamFromTodo(oldTeamId, todoId);
        await assignTeamToTodo(newTeamId, todoId);
      }
    }

    // Return a mock AxiosResponse to satisfy the return type
    return {
      data: {},
      status: 200,
      statusText: "OK",
      headers: {} as HeadersConfig,
      config: {} as InternalAxiosRequestConfig<Config>,
    };
  };

  const assignMeetingToTeam = async (
    meetingId: string,
    teamId: string
  ): Promise<AxiosResponse<any, any>> => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<AxiosResponse<any, any>>((resolve, reject) => {
      // Perform the meeting assignment logic here
      // For example, update the assignedMeetings record
      if (!assignedMeetings[meetingId]) {
        assignedMeetings[meetingId] = [teamId];
      } else {
        assignedMeetings[meetingId].push(teamId);
      }
      // Resolve the promise after completing the operation
      Promise.resolve();
      // TODO: Implement any additional logic needed when assigning a meeting to a team
    });
  };

  const assignProjectToTeam = async (
    projectId: string,
    teamId: string
  ): Promise<AxiosResponse<any, any>> => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<AxiosResponse<any, any>>((resolve, reject) => {
      // Perform the project assignment logic here
      // For example, update the assignedProjects record
      if (!assignedProjects[projectId]) {
        assignedProjects[projectId] = [teamId];
      } else {
        assignedProjects[projectId].push(teamId);
      }
      // Resolve the promise after completing the operation
      resolve({
        data: {},
        status: 200,
        statusText: "OK",
        headers: {} as HeadersConfig,
        config: {} as InternalAxiosRequestConfig<Config>,
      });
    });
  };

  const unassignTeamsFromProjects = async (
    Projects: any,
    Meetings: any,
    oldTeamId: string,
    todoIds: string[],
    projectIds: string[],
    meetingIds: string[]
  ) => {
    // Unassign old team from todos
    await Promise.all(
      projectIds.map(async (projectId: string) => {
        // Assuming unassignTeamToTodo is a function that unassigns a team from a todo
        await unassignTeamToTodo(projectId, oldTeamId);
      })
    );
  };

  const unassignTeamToTodo = async (todoId: string, teamId: string) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Check if the todoId exists in the assignedTodos
      if (assignedTodos[todoId]) {
        // Remove the team from the assignedTodos for the given todoId
        assignedTodos[todoId] = assignedTodos[todoId].filter(
          (id) => id !== teamId
        );

        // Remove the todoId entry if there are no more assigned teams
        if (assignedTodos[todoId].length === 0) {
          delete assignedTodos[todoId];
        }
      }

      // Resolve the promise after completing the operation
      resolve();
    });
  };

  const reassignTeamToTodo = async (
    todoId: string,
    oldTeamId: string,
    newTeamId: string
  ) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>((resolve) => {
      // Unassign old team and assign new team to todo
      unassignTeamToTodo(todoId, oldTeamId);
      assignTeamToTodo(todoId, newTeamId);

      // Resolve the promise after completing the operation
      resolve();
    });
  };

  const assignTeamToTodos = async (todoIds: Team[], teamId: string) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>(async (resolve) => {
      // Loop through todos and assign team to each
      for (let todoId of todoIds) {
        await assignTeamToTodo(String(todoId), teamId);
      }

      // Resolve the promise after completing the operation
      resolve();
    });
  };

  const unassignTeamToTodos = async (teamId: string, team: Team) => {
    // Loop through todos and unassign team from each
    for (let todoId of team.assignedTodos) {
      await unassignTeamToTodo(String(todoId), teamId);
      // Remove todoId from team's assignedTodos array
      team.assignedTodos = team.assignedTodos.filter(
        (id: any) => id !== todoId
      );
      // Remove todoId from team's assignedTodos array if empty
      if (team.assignedTodos.length === 0) {
        delete team.assignedTodos;
      }
      return { teamId, team };
    }
  };

  const unassignTeamFromTodos = async (todoIds: string[], teamId: string) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>(async (resolve) => {
      // Loop through todos and unassign team from each
      for (let todoId of todoIds) {
        await unassignTeamToTodo(todoId, teamId);
      }
      // Resolve the promise after completing the operation
      resolve();
    });
  };

  const reassignTeamToTodos = async (
    todoIds: string[],
    oldTeamId: string,
    newTeamId: string
  ) => {
    // Simulate an asynchronous operation, such as an API call
    return new Promise<void>(async (resolve) => {
      // Loop through todos and reassign team for each
      for (let todoId of todoIds) {
        await reassignTeamToTodo(todoId, oldTeamId, newTeamId);
      }

      // Resolve the promise after completing the operation
      resolve();
    });
  };

  const snapshotStore: SnapshotStore<Snapshot<Data, Data>> = {} as SnapshotStore<
    Snapshot<Data, Data>
    >;
  
  const assignPresentationStore: PresentationStore = {} as PresentationStore
  const store: AssignBaseStore = makeAutoObservable({
    ...assignPresentationStore,
    events,
    assignPresentationStore: assignPresentationStore,
    assignNote,
    assignedNotes: presentationStore().assignedNotes,
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

    assignedTodos,
    assignedTeams,
    assignTeamsToTodos,

    assignTeamToTodo,
    unassignTeamToTodo,
    unassignTeamsFromProjects,
    reassignTeamToTodo,
    assignTeamToTodos,
    unassignTeamToTodos,
    assignTeamMemberToTeam,
    assignTaskToTeam,
    assignTodoToTeam,
    unassignTeamMemberFromItem,
    assignUser,
    assignItem,
    assignTeam,
    unassignUser,
    reassignUser,
    assignUsersToItems,
    unassignUsersFromItems,
    reassignUsersToItems,
    connectResponsesToTodos,
    assignUserToTodo,
    unassignUserFromTodo,
    reassignUserInTodo,
    assignUsersToTodos,
    unassignUsersFromTodos,
    reassignUsersInTodos,
    assignUserSuccess,
    assignUserFailure,
    setDynamicNotificationMessage,
    reassignTeamToTodos,
    unassignTeamFromTodos,
    assignTodosToUsersOrTeams,
    reassignTeamsInTodos,
    assignMeetingToTeam,
    assignProjectToTeam,
    unassignTeamsFromTodos,
    snapshotStore: snapshotStore,
    assignedItems,
    assignFileToTeam,
    assignedProjects,
    assignNoteToTeam: useAssignTeamMemberStore().assignNoteToTeam,
 
    // Add more properties or methods as needed
  });
  return store;
};

export { useAssignBaseStore };
export type { ExtendedTodo };

