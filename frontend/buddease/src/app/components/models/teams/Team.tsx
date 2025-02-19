import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UserSettings } from "@/app/configs/UserSettings";
import { Persona } from "@/app/pages/personas/Persona";
import { ProfileAccessControl } from "@/app/pages/profile/Profile";
import React from "react";
import { FileTypeEnum } from "../../documents/FileType";
import useFiltering from "../../hooks/useFiltering";
import { Phase } from "../../phases/Phase";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../../projects/DataAnalysisPhase/DataAnalysisResult";
import { Project, ProjectType, reassignProject } from "../../projects/Project";
import SnapshotStore from "../../snapshots/SnapshotStore";
import { implementThen } from "../../state/stores/CommonEvent";
import { Settings } from "../../state/stores/SettingsStore";
import { DataProcessingTask } from "../../todos/tasks/DataProcessingTask";
import { Idea } from "../../users/Ideas";
import { User } from "../../users/User";
import { UserRole } from "../../users/UserRole";
import UserRoles from "../../users/UserRoles";
import { VideoData } from "../../video/Video";
import CommonDetails, { CommonData } from "../CommonData";
import { BaseData, Data, DataDetailsProps } from "../data/Data";
import { PriorityTypeEnum, StatusType, TeamStatus } from "../data/StatusType";
import generateTimeBasedCode from "../realtime/TimeBasedCodeGenerator";
import { Task, TaskData } from "../tasks/Task";
import { Progress } from "../tracker/ProgressBar";
import TeamData from "./TeamData";
import { Member, TeamMember } from "./TeamMembers";

import { BaseDataOperations } from '';
import { SearchOptions } from "@/app/pages/searchs/SearchOptions";
import { assignProject, unassignProject, updateProgress } from "../../calendar/CalendarApp";
import {
    CodingLanguageEnum,
    LanguageEnum,
} from "../../communications/LanguageEnum";
import { NotificationPreferenceEnum } from "../../notifications/Notification";
import { SortCriteria } from "../../settings/SortCriteria";
import { Snapshot } from "../../snapsho, updateProgressts/LocalStorageSnapshotStore";

// Assume 'options' is provided elsewhere
const options: SearchOptions = {
  communicationMode: "email", // Example communication mode
  size: "medium",
  animations: {
    type: "slide",
    duration: 300,
  },
  additionalOptions: {
    filters: [],
  },
  additionalOption2: undefined,
  defaultFileType: FileTypeEnum.Document,
  realTimeUpdates: false,
  theme: "",
  language: LanguageEnum.English,
  notificationPreferences: NotificationPreferenceEnum.Email,
  privacySettings: [],
  taskManagement: false,
  projectView: "",
  calendarSettings: undefined,
  dashboardPreferences: undefined,
  securityFeatures: [],
  newsOptions: {
    newsCategory: "",
    newsLanguage: "",
    sortBy: SortCriteria.Date,
    searchKeywords: [],
    excludeKeywords: [],
    // show: false,
    // showTime: false,
    // showDate: false,
    // showProject: false,
    // showTeam: false,
    // showUser: false,
    // showIdea: false,
    // showTask: false,
    // showData: false,
    // showVideo: false,
    // showSnapshot: false,
    // showProgress: false,
    // showTeamMember: false,
    // showIdeaMember: false,
    // showTaskMember: false,
    // showDataMember: false,
    // showVideoMember: false,
    // showSnapshotMember: false,
    // showProgressMember: false,
    // showTeamMemberTask: false,
    // showIdeaMemberTask: false,
    // showTaskMemberTask: false,
    // showDataMemberTask: false,
    // showVideoMemberTask: false,
    // showSnapshotMemberTask: false,
    // showProgressMemberTask: false,
    // showTeamMemberData: false,
    // showIdeaMemberData: false,
    // showTaskMemberData: false,
    // showDataMemberData: false,
    // showVideoMemberData: false,
    // showSnapshotMemberData: false,
  },
};

// Initialize the useFiltering hook with the provided options
const { addFilter } = useFiltering(options);

interface Team extends Data {
  team: {
    id: string;
    current: number;
    name: string;
    color: string | null;
    max: number;
    min: number;
    label: string;
    percentage: number;
    value: number;
    description: string;
    done: boolean;
  };
  _id: string;
  id: string;
  color: string | null
  teamName: string;
  description?: string;
  projects: Project[];
  creationDate: Date;
  isActive: boolean;
  leader: User | null;
  progress: Progress | null;
  percentage: number;
  data?: TeamData;
  members?: Member[];
  then?: <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(callback: (newData: Snapshot<BaseData, K>) => void) => Snapshot<Data, K> | undefined;
  pointOfContact?: TeamMember | null;
  currentProject?: Project | null;
  currentTeam?: Team | null;
  collaborationTools?: TeamData["collaborationTools"];
  globalCollaboration?: TeamData["globalCollaboration"];
  collaborationPreferences?: TeamData["collaborationPreferences"];

  assignedProjects: Project[];

  reassignedProjects: {
    projectId: string;
    project: Project | undefined;
    projectName: Project["name"];
    previousTeam: Team;
    reassignmentDate: Date;
  }[];
  assignProject(team: Team, project: Project, assignedDate: Date): void;
  reassignProject(
    team: Team,
    project: Project,
    previousTeam: Team,
    reassignmentDate: Date
  ): void;
  unassignProject(team: Team, project: Project): void;
  updateProgress(team: Team, project: Project): void;
  // Add other team-related fields as needed
}

const timeBasedCode = generateTimeBasedCode();
// Example usage:
const team: Team = {
  id: "1",
  teamName: "Development Team",
  description: "A team focused on software development",
  team: {
    id: "team-1",
    current: 0,
    max: 0,
    label: "",
    value: 0,
    percentage: 0,
    done: false,
    name: "",
    color: "",
    min: 0,
    description: "",
  },
  members: [
    {
      isAuthorized: false,
      _id: "member-1",
      id: 1,
      username: "user1",
      email: "user1@example.com",
      tier: "free",
      uploadQuota: 0,
      userType: "individual",
      fullName: "Sam Smith",
      bio: "bio content",
      hasQuota: true,
      profilePicture: "",
      processingTasks: [] as DataProcessingTask[],
      traits: "traits" as unknown as typeof CommonDetails,
      role: {} as UserRole,
      timeBasedCode: timeBasedCode,
      teamId: "1",
      roleInTeam: "admin",
      memberName: "Sam Smith",
      teams: [] as Team[],
      persona: {} as Persona,
      snapshots: [] as SnapshotStore<Snapshot<Data, Data>>[],
      token: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isAdmin: false,
      isActive: false,
      firstName: "",
      lastName: "",
      friends: [],
      blockedUsers: [],
      settings: {
        appName: "",
        userId: 0,
        userSettings: {} as NodeJS.Timeout,
        communicationMode: "",
        enableRealTimeUpdates: false,
        defaultFileType: "",
        allowedFileTypes: [],
        enableGroupManagement: false,
        enableTeamManagement: false,
        idleTimeout: {
          intervalId: undefined,
          isActive: false,
          animateIn: () => {},
          startAnimation: () => {},
          stopAnimation: () => {},
          resetIdleTimeout: function (): Promise<void> {
            return Promise.resolve();
          },
          idleTimeoutId: null,
          startIdleTimeout: (
            timeoutDuration: number,
            onTimeout: () => void | undefined
          ) => {},
          toggleActivation: async () => false,
        },
        startIdleTimeout: function (
          timeoutDuration: number,
          onTimeout: () => void
        ): void {
          if (this.idleTimeoutId) {
            clearTimeout(String(this.idleTimeoutId));
          }
          this.idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
        },
        idleTimeoutDuration: 0,
        activePhase: "",
        realTimeChatEnabled: false,
        todoManagementEnabled: false,
        notificationEmailEnabled: false,
        analyticsEnabled: false,
        twoFactorAuthenticationEnabled: false,
        projectManagementEnabled: false,
        documentationSystemEnabled: false,
        versionControlEnabled: false,
        userProfilesEnabled: false,
        accessControlEnabled: false,
        taskManagementEnabled: false,
        loggingAndNotificationsEnabled: false,
        securityFeaturesEnabled: false,
        theme: "",
        language: "" as LanguageEnum | CodingLanguageEnum,
        fontSize: 0,
        darkMode: false,
        enableEmojis: false,
        enableGIFs: false,
        emailNotifications: false,
        pushNotifications: false,
        notificationSound: "",
        timeZone: "",
        dateFormat: "",
        timeFormat: "",
        defaultProjectView: "",
        taskSortOrder: "",
        showCompletedTasks: false,
        projectColorScheme: "",
        showTeamCalendar: false,
        teamViewSettings: [],
        defaultTeamDashboard: "",
        passwordExpirationDays: 0,
        privacySettings: [],
        thirdPartyApiKeys: undefined,
        externalCalendarSync: false,
        dataExportPreferences: [],
        dashboardWidgets: [],
        customTaskLabels: [],
        customProjectCategories: [],
        customTags: [],
        formHandlingEnabled: false,
        paginationEnabled: false,
        modalManagementEnabled: false,
        sortingEnabled: false,
        notificationSoundEnabled: false,
        localStorageEnabled: false,
        clipboardInteractionEnabled: false,
        deviceDetectionEnabled: false,
        loadingSpinnerEnabled: false,
        errorHandlingEnabled: false,
        toastNotificationsEnabled: false,
        datePickerEnabled: false,
        themeSwitchingEnabled: false,
        imageUploadingEnabled: false,
        passwordStrengthEnabled: false,
        browserHistoryEnabled: false,
        geolocationEnabled: false,
        webSocketsEnabled: false,
        dragAndDropEnabled: false,
        idleTimeoutEnabled: false,
        enableAudioChat: false,
        enableVideoChat: false,
        enableFileSharing: false,
        enableBlockchainCommunication: false,
        enableDecentralizedStorage: false,
        selectDatabaseVersion: "",
        selectAppVersion: "",
        isAuthorized: true,

        enableDatabaseEncryption: false,
        id: "",
        filter(
          key:
            | keyof Settings
            | "communicationMode"
            | "defaultFileType"
            | "realTimeUpdates"
            | "theme"
            | "language"
            | "notificationPreferences"
            | "privacySettings"
            | "taskManagement"
            | "projectView"
            | "calendarSettings"
            | "dashboardPreferences"
            | "securityFeatures"
        ): void {
          // Filtering based on the provided key
          switch (key) {
            case "communicationMode":
              addFilter(
                "communicationMode",
                "equal",
                options.communicationMode
              );
              break;
            case "defaultFileType":
              addFilter("defaultFileType", "equal", options.defaultFileType);
              break;
            // Add cases for other keys as needed
            case "realTimeUpdates":
              addFilter("realTimeUpdates", "equal", options.realTimeUpdates);
              break;
            case "theme":
              addFilter("theme", "equal", options.theme);
              break;
            case "language":
              addFilter("language", "equal", options.language);
              break;
            case "notificationPreferences":
              addFilter(
                "notificationPreferences",
                "equal",
                options.notificationPreferences
              );
              break;
            case "privacySettings":
              addFilter("privacySettings", "equal", options.privacySettings[0]);
              break;
            case "taskManagement":
              addFilter("taskManagement", "equal", options.taskManagement);
              break;
            case "projectView":
              addFilter("projectView", "equal", options.projectView);
              break;
            case "calendarSettings":
              addFilter(
                "calendarSettings",
                "equal",
                options.calendarSettings || ""
              );
              break;
            case "dashboardPreferences":
              addFilter(
                "dashboardPreferences",
                "equal",
                options.dashboardPreferences || ""
              );
              break;
            case "securityFeatures":
              addFilter(
                "securityFeatures",
                "equal",
                options.securityFeatures[0]
              );
              break;
            // Add more cases for other settings options as needed
            default:
              // Default case if the provided key doesn't match any expected value
              console.error(`Unhandled key "${key}" in settings filter.`);
              break;
          }
        },
      },
      interests: [],
      privacySettings: undefined,
      notifications: {
        email: false,
        push: false,
        sms: false,
        chat: false,
        calendar: false,
        task: false,
        file: false,
        meeting: false,
        announcement: false,
        reminder: false,
        project: false,
        audioCall: false,
        videoCall: false,
        screenShare: false,
        mention: false,
        reaction: false,
        follow: false,
        poke: false,
        activity: false,
        thread: false,
        inviteAccepted: true,
        directMessage: false,
        enabled: false,
        notificationType: "sms",
      },
      activityLog: [],
      projects: [],
      socialLinks: undefined,
      relationshipStatus: null,
      hobbies: [],
      skills: [],
      achievements: [],
      profileVisibility: "",
      profileAccessControl: {} as ProfileAccessControl,
      activityStatus: "",
    },
    {
      _id: "member-2",
      id: 2,
      username: "user2",
      email: "user2@example.com",
      tier: "standard",
      uploadQuota: 100,
      userType: "organization",

      fullName: "Benny Johnson",
      bio: "bio content",
      hasQuota: false,
      profilePicture: "",
      processingTasks: [] as DataProcessingTask[],
      role: {} as UserRole,
      traits: "traits" as unknown as typeof CommonDetails,
      timeBasedCode: timeBasedCode,
      teamId: "1",
      roleInTeam: "moderator",
      memberName: "Jane English",
      persona: {} as Persona,
      snapshots: [] as SnapshotStore<Snapshot<Data, Data>>[],
      token: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isAdmin: false,
      isActive: false,
      firstName: "",
      lastName: "",
      friends: [],
      blockedUsers: [],
      settings: {} as UserSettings,
      interests: [],
      privacySettings: undefined,
      notifications: {
        email: false,
        push: false,
        sms: false,
        chat: false,
        calendar: false,
        task: false,
        file: false,
        meeting: false,
        announcement: false,
        reminder: false,
        project: false,
        audioCall: false,
        videoCall: false,
        screenShare: false,
        mention: false,
        reaction: false,
        follow: false,
        poke: false,
        activity: false,
        thread: false,
        inviteAccepted: true,
        directMessage: false,
        enabled: false,
        notificationType: "push",
      },
      activityLog: [],
      projects: [],
      socialLinks: undefined,
      relationshipStatus: null,
      hobbies: [],
      skills: [],
      achievements: [],
      profileVisibility: "",
      profileAccessControl: {
        friendsOnly: false,
        allowTagging: false,
        blockList: [],
        allowMessagesFromNonContacts: false,
        shareProfileWithSearchEngines: false,
        isPrivate: false,
        isPrivateOnly: false,
        isPrivateOnlyForContacts: false,
        isPrivateOnlyForGroups: false,
      },
      activityStatus: "",
      isAuthorized: false,
    },
  ],
  projects: [
    {
      _id: "project-1",
      id: "1",
      title: "Team Projects",
      status: "pending",
      phase: {} as Phase,
      then: implementThen,
      analysisType: AnalysisTypeEnum.IMAGE,
      analysisResults: {} as DataAnalysisResult[],
      tags: [],
      name: "Project A",
      description: "Description of Project A",
      members: [],
      tasks: [],
      videoData: {} as VideoData,
      videoUrl: "videoUrl",
      videoThumbnail: "videoThumbnail",
      videoDuration: 0,
      startDate: new Date(),
      endDate: new Date(),
      phases: [],
      currentPhase: null,
      isActive: true,
      leader: null,
      budget: 0,
      ideas: {} as Idea[],
      type: ProjectType.Default,
      timestamp: undefined,
      category: "",
    },
    {
      _id: "project-2",
      id: "2",
      title: "Team Projects",
      status: "pending",
      phase: {} as Phase,
      then: implementThen,
      analysisType: AnalysisTypeEnum.IMAGE,
      analysisResults: {} as DataAnalysisResult[],
      tags: [],
      name: "Project B",
      description: "Description of Project B",
      members: [],
      phases: [],
      currentPhase: "Planning" as unknown as Phase,
      videoUrl: "videoUrl",
      videoThumbnail: "videoThumbnail",
      videoDuration: 0,
      videoData: {} as VideoData,
      ideas: {} as Idea[],
      type: ProjectType.Internal,
      tasks: [
        {
          _id: "project",
          id: "1",
          title: "Task 1",
          description: "Description of Task 1",
          phase: {} as Phase,
          assignedTo: [],
          then(arg0: (newTask: Team) => void): void {
            const newTask = {
              _id: "task-2",
              id: "2",
              title: "Task 2",
              description: "Description of Task 2",
              assignedTo: [],
              previouslyAssignedTo: [],
              done: false,
              dueDate: new Date(),
              status: "todo",
              priority: "low",
              estimatedHours: null,
              actualHours: null,
              startDate: undefined,
              endDate: new Date(),
              completionDate: new Date(),
              isActive: true,
              tags: [],
              dependencies: [],
              team: {
                id: "1",
                name: "Team A",
                color: "#000000",
                label: "Team A",
                current: 0,
                max: 100,
                min: 0,
                percentage: 0,
                value: 0,
                description: " ",
                done: false,
              },
              teamName: "Team A",
              projects: [],
              creationDate: new Date(),
              progress: {} as Progress,
              percentage: 0,
              leader: {} as User,
              assignedProjects: [],
              reassignedProjects: [],
              assignProject: assignProject,
              reassignProject: reassignProject,
              unassignProject: unassignProject,
              updateProgress: updateProgress,
            };
            arg0(newTask);
            return;
          },
          data: {} as TaskData,
          previouslyAssignedTo: [],
          done: false,
          dueDate: new Date(),
          status: TeamStatus.Pending,
          priority: PriorityTypeEnum.Low,
          estimatedHours: null,
          actualHours: null,
          startDate: new Date(),
          endDate: new Date(),
          completionDate: new Date(),
          isActive: true,
          tags: [], // Assuming tasks can have tags
          dependencies: [],
          analysisType: AnalysisTypeEnum.TEXT,
          analysisResults: [],
          assigneeId: "1",
          payload: {},
          type: "addTask",
          videoThumbnail: "",
          videoDuration: 0,
          videoUrl: "",
          [Symbol.iterator]: () => {
            // Add more tasks as needed
            return {
              next: () => {
                return {
                  done: true,
                  value: {
                    _id: "task-2",
                    id: "2",
                    title: "Task 2",
                    description: "Description of Task 2",
                    assignedTo: [],
                    previouslyAssignedTo: [],
                    done: false,
                    dueDate: new Date(),
                    status: "todo",
                    priority: "low",
                    estimatedHours: null,
                    actualHours: null,
                    startDate: null,
                    endDate: new Date(),
                    completionDate: new Date(),
                    isActive: true,
                    tags: [],
                    dependencies: [],
                  },
                };
              },
            };
          },
          // data: {} as Data,
          source: "user",
          some: (
            callbackfn: (value: Task, index: number, array: Task[]) => unknown,
            thisArg?: any
          ) => {
            // Add more tasks as needed
            return true;
          },
          videoData: {} as VideoData,
          ideas: {} as Idea[],
          timestamp: undefined,
          category: "",
        },
      ],
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      leader: null,
      budget: 0,
      timestamp: undefined,
      category: "",
    },
  ],
  creationDate: new Date(),
  progress: {} as Progress,
  isActive: true,
  leader: {
    _id: "3",
    id: 3,
    username: "teamLeader",
    email: "leader@example.com",
    tier: "premium",
    uploadQuota: 200,
    userType: "organization",
    fullName: "Baine Sanders",
    bio: "bio content",
    hasQuota: false,
    profilePicture: "profile picture",
    processingTasks: [] as DataProcessingTask[],
    traits: "traits" as unknown as typeof CommonDetails,
    role: UserRoles.Guest,
    timeBasedCode: timeBasedCode,
    persona: {} as Persona,
    snapshots: [] as SnapshotStore<Snapshot<Data, Data>>[],
  } as User,

  then(callback: (newData: Team) => void) {
    const newData = {
      _id: "team-1",
      id: "1",
      description: "Description of Team A",
      members: [],
      projects: [],
      creationDate: new Date(),
      progress: {} as Progress,
      isActive: true,
      leader: null,
      budget: 0,
      timestamp: new Date(),
      data: {} as TeamData & Team,
      category: "Technology",
      content: undefined,
      team: {
        id: "string",
        current: 0,
        name: "string",
        color: "string",
        max: 100,
        min: 0,
        label: "string",
        percentage: 0,
        value: 0,
        description: "string",
        done: false,
      },
      teamName: "",
      percentage: 0,
      assignedProjects: [],
      reassignedProjects: [],
      assignProject: assignProject,
      reassignProject: reassignProject,
      unassignProject: unassignProject,
      updateProgress: updateProgress,
    };
    callback(newData);
  },
  data: {} as TeamData & Team,
  assignedProjects: [],
  reassignedProjects: [],
  assignProject(team: Team, project: Project): void {
    // Implement the logic to assign a project to the team
    team.assignedProjects.push(project);
  },
  unassignProject: function (team: Team, project: Project) {
    // Implement the logic to unassign a project from the team
    const index = team.assignedProjects.findIndex((p) => p.id === project.id);
    if (index !== -1) {
      team.assignedProjects.splice(index, 1); // Remove from current team's assigned projects
    }
  },

  reassignProject: (
    team: Team,
    project: Project,
    previousTeam: Team,
    reassignmentDate: Date
  ) => {
    // Update the project's team reference
    project.team = team;

    // Remove the project from the previous team's projects
    previousTeam.projects = previousTeam.projects.filter(
      (proj) => proj.id !== project.id
    );

    // Add the project to the new team's projects
    team.projects.push(project);
  },

  updateProgress: function (team: Team, project: Project) {
    // Implement the logic to update the team's progress
    // Example: Calculate progress based on assigned projects
    const totalAssignedProjects = team.assignedProjects.length;
    const completedProjects = team.assignedProjects.filter(
      (project) => project.status === "completed"
    ).length;

    const progressValue =
      totalAssignedProjects > 0
        ? (completedProjects / totalAssignedProjects) * 100
        : 0;

    // Update the progress object
    team.progress = {
      id: team._id,
      name: team.name,
      value: progressValue,
      label: `${progressValue}% completed`, // Example label
      current: 0, // Update current progress value
      max: 100, // Set max progress value
      percentage: 0,
      min: 0,
      description: "team progress",
      color: "primary",
      done: progressValue === 100,
    };
  },
  currentProject: null,
  _id: "",
  title: "",
  status: "scheduled",
  tags: [],
  phase: null,
  analysisType: AnalysisTypeEnum.PROJECT,
  analysisResults: [],
  videoData: {} as VideoData,
  percentage: 0,
  timestamp: undefined,
  category: "",
};

const TeamDetails: React.FC<{ team: Team }> = ({ team }) => {
  // Check if team is not undefined before passing it to CommonDetails
  const data: CommonData | undefined = team
    ? { ...team, completed: true }
    : undefined;

  const setCurrentProject = (project: Project) => {
    // Set the current project for the team
    team.currentProject = project;
  };

  const clearCurrentProject = () => {
    // Clear the current project for the team
    team.currentProject = null;
  };

  const setCurrentTeam = (team: Team) => {
    // Set the current team for the team
    team.currentTeam = team;
  };

  return (
    <CommonDetails
      data={data}
      details={{
        _id: team._id,
        id: team.id,
        type: "team",
        title: team.title || "",
        name: team.teamName,
        isActive: team.isActive,
        progress: team.progress,
        description: team.description,
        analysisResults: team.analysisResults,
        assignedProjects: team.assignedProjects,
        reassignedProjects: team.reassignedProjects
          .filter((reassignment) => reassignment.project !== undefined)
          .map(
            ({
              projectId,
              project,
              projectName,
              previousTeam,
              reassignmentDate,
            }) => ({
              project: project!,
              previousTeam,
              reassignmentDate,
            })
          ),
        updatedAt: team.updatedAt ? team.updatedAt : new Date(),
        setCurrentTeam: setCurrentTeam,
        setCurrentProject: setCurrentProject,
        clearCurrentProject: clearCurrentProject,
        // Include other team-specific properties here
      }}
    />
  );
};

const DataDetailsComponent: React.FC<DataDetailsProps<any>> = ({ data }) => (
  <CommonDetails
    data={{
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as StatusType | undefined,
      completed: false,
    }}
    details={{
      _id: data._id,
      id: data.id as string,
      phase: data.phase,
      description: data.description,
      isActive: data.isActive,
      type: data.type,
      updatedAt: data.updatedAt,
      analysisResults: data.analysisResults,
      // Include other generic data properties here
    }}
  />
);

export { DataDetailsComponent, team, TeamDetails };
export type { Team };

