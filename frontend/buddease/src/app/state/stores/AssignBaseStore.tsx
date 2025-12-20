// AssignBaseStore.tsx
import { Config } from '@/app/api/ConfigManager';
import { HeadersConfig } from '@/app/api/headers/HeadersConfig';
import teamApiService from '@/app/api/TeamApi';
import CalendarEventTimingOptimization, { ExtendedCalendarEvent } from '@/app/calendar/CalendarEventTimingOptimization';
import { Team } from '@/app/components/teams/Team';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { NotificationType, NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { AnalyticsLogger, AssignBaseStoreLogger } from '@/app/logging/Logger';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { useNotification } from '@/app/state/context/NotificationContext';
import { Todo, UserAssignee } from '@/app/todos/Todo';
import { todoService } from '@/app/todos/TodoService';
import type { AppUser } from '@/app/typings/entities/UserEntity';
import { User } from '@/app/users/User';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { makeAutoObservable } from 'mobx';
import { ReassignEventResponse } from '@/app/state/stores/AssignEventStore';
import { useAssignTeamMemberStore } from '@/app/state/stores/AssignTeamMemberStore';
import { AuthStore } from '@/app/state/stores/AuthStore';
import { PresentationStore, presentationStore } from '@/app/state/stores/presentationStore';

const { notify } = useNotification();

interface ExtendedTodo extends Todo {
  // Add additional properties specific to ExtendedTodo if needed
  additionalField: string;

}

export interface AssignBaseStore<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  > {
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

  setDynamicNotificationMessage: (message: Message<T, K, Meta, Attachment, ExcludedFields, IncludedFields>, type: NotificationType) => void;
  snapshotStore: SnapshotStore<T, K, Meta, Attachment, ExcludedFields, IncludedFields>;

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


  setAssignedTaskStore: (store: SnapshotStore<T, K, Meta, Attachment, ExcludedFields, IncludedFields>) => void;
  // Add more methods or properties as needed
}

const useAssignBaseStore = (): AssignBaseStore<AppUser> => {
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
        todo.assignee = responseMap[todo.id].assignee as unknown as User<AppUser>;
      }
    }
  };


  const todosStore: { [key: string]: Todo } = {};
  const usersStore: { [key: string]: UserAssignee } = {}; // Example user store
    
  const assignUserToTodo = (todoId: string, userId: string): void => {
    // Check if the todo exists in the todosStore
    const todo = todosStore[todoId];
    if (!todo) {
      throw new Error(`Todo ${todoId} not found`);
    }

    // Check if the user exists in the usersStore
    const user = usersStore[userId];
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Check if the user is not already assigned to the todo
    if (todo.assignedUsers.includes(userId)) {
      console.log(`User ${userId} is already assigned to Todo ${todoId}`);
      return;
    }

    todo.assignedUsers.push(userId);
    
    // Update assigneeId and assignee if there's only one assignee
    if (todo.assignedUsers.length === 1) {
      todo.assigneeId = userId;
      todo.assignee = user;
    }

    // === ADDITIONAL LOGIC ===
    
    // 1. Update user's assigned todos count
    if (usersStore[userId]) {
      usersStore[userId].assignedTodosCount = (usersStore[userId].assignedTodosCount || 0) + 1;
    }
    
    // 2. Update todo assignment timestamp
    todo.lastAssignedAt = new Date().toISOString();
    
    // 3. Update analytics
    AnalyticsLogger.logTaskAssignment(todoId, userId);
    
    // 4. Check for assignment limits
    const userAssignmentCount = Object.values(todosStore).filter(
      t => t.assignedUsers.includes(userId)
    ).length;
    
    if (userAssignmentCount > 10) {
      console.warn(`User ${userId} has ${userAssignmentCount} assigned todos - consider workload`);
    }

    // Update Todo Store
    todosStore[todoId] = todo;

    // Send Notification
    AssignBaseStoreLogger.sendAssignmentNotification(userId, todoId).catch(console.error);
    
    // Log Activity
    AssignBaseStoreLogger.logAssignmentActivity(userId, todoId).catch(console.error);

    // Save changes (fire and forget)
    todo.save().then(() => {
      console.log(`User ${userId} assigned to Todo ${todoId}`);
    }).catch(error => {
      console.error(`Error saving Todo ${todoId}:`, error);
    });

    // Trigger any assignment hooks/callbacks (fire and forget)
    if (todo.onAssignment) {
      try {
        todo.onAssignment(userId);
      } catch (error) {
        console.error(`Error in todo assignment callback:`, error);
      }
    }
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
    // Additional logic implementation:
    
    // 1. Batch notification for multiple assignments
    if (todoIds.length > 1) {
      const message = `User ${userId} assigned to ${todoIds.length} todos`;
      setDynamicNotificationMessage(
        message,
        NotificationTypeEnum.ASSIGNMENT_OPERATION_SUCCESS
      );
    }
    
    // 2. Update user workload metrics
    const totalAssignments = todoIds.length;
    TeamLogger.logUserWorkloadUpdate(userId, totalAssignments);
    
    // 3. Check for potential assignment conflicts
    const conflictingTodos = todoIds.filter(todoId => {
      const todo = todosStore[todoId];
      return todo && todo.priority === 'high' && todo.deadline;
    });
    
    if (conflictingTodos.length > 0) {
      console.warn(`User ${userId} assigned to ${conflictingTodos.length} high-priority todos with deadlines`);
    }
  };

  const unassignUsersFromTodos = (todoIds: string[], userId: string) => {
    todoIds.forEach((todoId) => {
      unassignUserFromTodo(todoId, userId);
    });
    
    // TODO: Implement any additional logic needed when unassigning a user from multiple todos
    // Additional logic implementation:
    
    // 1. Batch unassignment analytics
    AnalyticsLogger.logTaskUnassignments(userId, todoIds.length);
    
    // 2. Update user metrics
    if (usersStore[userId]) {
      usersStore[userId].assignedTodosCount = Math.max(
        0,
        (usersStore[userId].assignedTodosCount || 0) - todoIds.length
      );
    }
    
    // 3. Check if todos need reassignment
    const unassignedTodos = todoIds.filter(todoId => {
      const todo = todosStore[todoId];
      return todo && todo.assignedUsers.length === 0 && todo.status !== 'completed';
    });
    
    if (unassignedTodos.length > 0) {
      console.warn(`${unassignedTodos.length} todos are now unassigned and may need attention`);
    }
  };

  const reassignUsersInTodos = (
    todoIds: string[],
    oldUserId: string,
    newUserId: string
  ) => {
    todoIds.forEach((todoId) => {
      unassignUserFromTodo(todoId, oldUserId);
      assignUserToTodo(todoId, newUserId);
    });
    
    // TODO: Implement any additional logic needed when reassigning a user from old user to new user for multiple todos
    // Additional logic implementation:
    
    // 1. Track reassignment metrics
    const reassignmentData = {
      oldUserId,
      newUserId,
      todoCount: todoIds.length,
      timestamp: new Date().toISOString()
    };
    
    // 2. Log reassignment activity
    TeamLogger.logReassignmentActivity(reassignmentData);
    
    // 3. Update workload balance
    if (usersStore[oldUserId]) {
      usersStore[oldUserId].assignedTodosCount = Math.max(
        0,
        (usersStore[oldUserId].assignedTodosCount || 0) - todoIds.length
      );
    }
    
    if (usersStore[newUserId]) {
      usersStore[newUserId].assignedTodosCount = (usersStore[newUserId].assignedTodosCount || 0) + todoIds.length;
    }
    
    // 4. Send reassignment notifications
    todoIds.forEach(todoId => {
      const todo = todosStore[todoId];
      if (todo && todo.notifyOnReassignment) {
        AssignBaseStoreLogger.sendReassignmentNotification(
          oldUserId,
          newUserId,
          todoId,
          todo.title
        );
      }
    });
  };

  // Success and Failure methods
  const assignUserSuccess = () => {
    console.log("Assign user success!");
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
      NotificationTypeEnum.ASSIGNMENT_OPERATION_SUCCESS
    );
  };

  const assignUserFailure = (error: string) => {
    console.error("Assign user failure:", error);
    // You can add additional error handling or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.User.ASSIGN_USER_FAILURE,
      NotificationTypeEnum.ERROR
    );
  };



  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string | Message<AppUser>, type: NotificationType) => {
    setDynamicNotificationMessage(message, type);
  };

  const assignTaskToTeam = async (taskId: string, teamId: string) => {
    // Existing code...
    
    // TODO: Implement any additional logic needed when assigning a task to a team
    // Additional logic implementation:
    
    // 1. Validate team capacity
    const teamTasks = Object.values(assignedTasks).filter(
      tasks => tasks.includes(teamId)
    ).length;
    
    if (teamTasks > 50) { // Example team capacity
      console.warn(`Team ${teamId} has ${teamTasks} assigned tasks - near capacity`);
    }
    
    // 2. Update team task distribution
    TeamLogger.logTaskDistribution(teamId, taskId);
    
    // 3. Trigger team notification
    if (teamApiService.notifyTeam) {
      await teamApiService.notifyTeam(teamId, {
        type: 'task_assigned',
        taskId,
        timestamp: new Date().toISOString()
      });
    }
    
    // 4. Update task assignment history
    const task = {}; // Assuming task object exists
    if (task) {
      task.assignmentHistory = task.assignmentHistory || [];
      task.assignmentHistory.push({
        assignedTo: teamId,
        assignedAt: new Date().toISOString(),
        type: 'team'
      });
    }
  };

  const assignTodoToUser = async (user: User<AppUser>, todo: Todo) => {
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
    // Existing code...
    
    // TODO: Implement any additional logic needed when assigning a todo to a team
    // Additional logic implementation:
    
    // 1. Validate team exists and is active
    try {
      const teamResponse = await teamApiService.getTeamById(teamId);
      const team = teamResponse.data[0];
      
      if (!team || team.status !== 'active') {
        throw new Error(`Team ${teamId} is not active or doesn't exist`);
      }
    } catch (error) {
      console.error(`Error validating team ${teamId}:`, error);
      throw error;
    }
    
    // 2. Update team todo metrics
    TeamLogger.logTeamTodoAssignment(teamId, todoId);
    
    // 3. Check for duplicate assignments
    const existingTeamAssignments = assignedTodos[todoId] || [];
    if (existingTeamAssignments.includes(teamId)) {
      console.warn(`Team ${teamId} is already assigned to todo ${todoId}`);
      return;
    }
    
    // 4. Update todo with team assignment metadata
    const todo = todosStore[todoId];
    if (todo) {
      todo.assignedTeams = todo.assignedTeams || [];
      todo.assignedTeams.push(teamId);
      todo.lastTeamAssignment = new Date().toISOString();
    }
  };

  const assignTeamMemberToTeam = (itemId: string, userId: string) => {
    // Existing code...
    
    // TODO: Implement any additional logic needed when assigning a team member to an item
    // Additional logic implementation:
    
    // 1. Validate user is actually a member of the team
    const teamMembers = []; // Assuming this comes from team data
    if (!teamMembers.includes(userId)) {
      throw new Error(`User ${userId} is not a member of the team`);
    }
    
    // 2. Update user's assigned items count
    if (usersStore[userId]) {
      usersStore[userId].teamAssignments = (usersStore[userId].teamAssignments || 0) + 1;
    }
    
    // 3. Log the assignment for audit purposes
    SecurityLogger.logTeamMemberAssignment(itemId, userId);
    
    // 4. Check assignment limits per user
    const userTeamAssignments = Object.values(assignedTeams).filter(
      users => users.includes(userId)
    ).length;
    
    if (userTeamAssignments > 5) { // Example limit
      console.warn(`User ${userId} has ${userTeamAssignments} team assignments`);
    }
    
    // 5. Trigger notification to team lead
    TeamLogger.logMemberAssignmentNotification(itemId, userId);
  };


  const unassignTeamMemberFromItem = (itemId: string, userId: string) => {
    // Existing code...
    
    // TODO: Implement any additional logic needed when unassigning a team member from an item
    // Additional logic implementation:
    
    // 1. Update user's assignment metrics
    if (usersStore[userId]) {
      usersStore[userId].teamAssignments = Math.max(
        0,
        (usersStore[userId].teamAssignments || 0) - 1
      );
    }
    
    // 2. Log unassignment for audit trail
    SecurityLogger.logTeamMemberUnassignment(itemId, userId);
    
    // 3. Check if item still has assigned members
    const remainingMembers = assignedTeams[itemId]?.length || 0;
    if (remainingMembers === 0) {
      console.warn(`Item ${itemId} has no assigned team members`);
      
      // Optionally assign to default team member
      const defaultMember = getDefaultTeamMember(itemId);
      if (defaultMember) {
        assignTeamMemberToTeam(itemId, defaultMember);
      }
    }
    
    // 4. Update item's last modification
    const item = {}; // Assuming item object exists
    if (item) {
      item.lastModified = new Date().toISOString();
      item.lastModifiedBy = userId;
    }
  };

  

  
  const assignTeamToTodo = async (todoId: string, teamId: string): Promise<void> => {
    try {
      /* -------  backend call  --------------------------------------- */
      await teamApiService.assignTodoToTeam(todoId, teamId); // Assuming this exists or needs to be created

      /* -------  local observable bookkeeping  ----------------------- */
      const list = assignedTodos[todoId] ?? [];
      if (!list.includes(teamId)) {
        list.push(teamId);
        assignedTodos[todoId] = list;
      }

      /* -------  additional logic for team assignment  --------------- */
      
      // 1. Update the todo object in todosStore if it exists
      const todo = todosStore[todoId];
      if (todo) {
        todo.assignedTeams = todo.assignedTeams || [];
        if (!todo.assignedTeams.includes(teamId)) {
          todo.assignedTeams.push(teamId);
        }
        todo.lastTeamAssignment = new Date().toISOString();
      }

      // 2. Update team metrics
      const teamAssignments = Object.values(assignedTodos).filter(
        teams => teams.includes(teamId)
      ).length;
      
      if (teamAssignments > 20) { // Example team capacity limit
        console.warn(`Team ${teamId} has ${teamAssignments} assigned todos - near capacity`);
      }

      // 3. Log the assignment for analytics
      TeamLogger.logTeamTodoAssignment(teamId, todoId);

      // 4. Update team workload distribution
      if (teamApiService.updateTeamWorkload) {
        await teamApiService.updateTeamWorkload(teamId, { todoId, action: 'assigned' });
      }

            const message = `User ${userId} assigned to ${todoIds.length} todos`;


      /* -------  optional user-facing notification  ------------------ */
      notify(
        NOTIFICATION_MESSAGES.Todos.ASSIGN_TEAM_SUCCESS,
        NotificationTypeEnum.SUCCESS
      );

    } catch (error) {
      console.error(`Failed to assign team ${teamId} to todo ${todoId}:`, error);
      
      /* -------  error notification  --------------------------------- */
      notify(
        NOTIFICATION_MESSAGES.Todos.ASSIGN_TEAM_FAILURE,
        NotificationTypeEnum.ERROR
      );
      
      throw error; // Re-throw to let caller handle the error
    }
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
            assignee as unknown as User<AppUser>,
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
    todoIds: number[],
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

  const assignMeetingToTeam = async (meetingId: string, teamId: string): Promise<AxiosResponse<void>> => {
    /* -------  backend call  --------------------------------------- */
    const res = await teamApiService.assignMeeting(meetingId, teamId); // returns AxiosResponse

    /* -------  local observable bookkeeping  ----------------------- */
    const list = assignedMeetings.get(meetingId) ?? [];
    if (!list.includes(teamId)) list.push(teamId);
    assignedMeetings.set(meetingId, list);

    /* -------  optional user-facing notification  ------------------ */
    notify(
      NOTIFICATION_MESSAGES.Meeting.ASSIGN_SUCCESS,
      NotificationTypeEnum.SUCCESS
    );

    return res; // AxiosResponse<void> (or whatever your service returns)
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

  const snapshotStore: SnapshotStore<AppUser> = {} as SnapshotStore<AppUser>

  const assignPresentationStore: PresentationStore = {} as PresentationStore
  const store: AssignBaseStore<AppUser> = makeAutoObservable({
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
 


    getAuthStore, unassignNoteFromTeam, assignContactToTeam, assignEventToTeam,
    assignGoalToTeam, assignBookmarkToTeam, assignCalendarEventToTeam, assignBoardItemToTeam,
    assignBoardColumnToTeam, assignBoardListToTeam, assignBoardCardToTeam, assignBoardViewToTeam, 
    
    // Add more properties or methods as needed
  });
  return store;
};

export { useAssignBaseStore };
export type { ExtendedTodo };

