// ExampleTeam.ts
import { AppTeamEntity TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields } from '@/app/typings/entities/TeamEntity'
import { PriorityTypeEnum, TeamStatus } from '@/app/models/data/StatusType';
import { Phase } from '@/app/models/phases/Phase';
import { assignProject, Project, ProjectType, reassignProject, unassignProject } from '@/app/models/projects/Project';
import { Task, TaskData } from '@/app/models/tasks/Task';
import { TeamData } from '@/app/models/teams/TeamData';
import { Progress } from '@/app/models/tracker/ProgressBar';
import { UserRole } from '@/app/models/UserRole';
import UserRoles from '@/app/models/UserRoles';
import { Persona } from '@/app/pages/personas/Persona';
import { ProfileAccessControl } from '@/app/pages/profile/Profile';
import { DataAnalysisResult } from '@/app/projects/DataAnalysisPhase/DataAnalysisResult';
import { Settings } from '@/app/state/stores/SettingsStore';
import { DataProcessingTask } from '@/app/todos/tasks/DataProcessingTask';
import { AnalysisTypeEnum } from '@/app/typings/AnalysisType';
import { VideoData } from '@/app/typings/videoTypes/Video';
import { Idea } from '@/app/users/Ideas';
import { User } from '@/app/users/User';
import { UserSettings } from '@/app/config/UserSettings';

import {
  CodingLanguageEnum,
  LanguageEnum,
} from '@/app/communications/LanguageEnum';
import { ThemeEnum } from '@/app/libraries/ui/theme/Theme';
import { DefaultMeta } from '@/app/config/BaseConfig';

import { updateProgress } from '@/app/components/calendar/CalendarApp';
import { CommonDetails } from '@/app/components/models/details/CommonDetails';
import { ExcludedFields } from '@/app/components/routing/Fields';
import { K, Meta, T } from '@/app/models/data/dataStoreMethods';
import generateTimeBasedCode '@/app/models/realtime/TimeBasedCodeGenerator';
import { Team } from '@/app/components/teams/Team';
import { Snapshot } from '@/app/snapshots';
import { Snapshots } from '@/app/snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields} from '@/app/typings/entities/MemberEntity';
import { options } from 'sanitize-html';
import { useFiltering } from '@/app/hooks/useFiltering'
const timeBasedCode = generateTimeBasedCode();
const { addFilter } = useFiltering(options);

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
      snapshots: [] as Snapshots<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>,
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
          idleTimeoutDuration: 0,
          idleTimeoutId: null as NodeJS.Timeout | null,
            startIdleTimeout: function (
            timeoutDuration: number,
            onTimeout: () => void
          ): void {
            if (this.idleTimeout.idleTimeoutId) {
              clearTimeout(this.idleTimeout.idleTimeoutId);
            }
            this.idleTimeout.idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
          },
          toggleActivation: async () => false,
        },
        startIdleTimeout: function (
          timeoutDuration: number,
          onTimeout: () => void
        ): void {
            if (this.idleTimeout.idleTimeoutId) {
              clearTimeout(this.idleTimeout.idleTimeoutId as NodeJS.Timeout);
            }
            this.idleTimeout.idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
          },
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
        theme: {} as ThemeEnum,
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
      activityStatus: ""
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
      members: [] as SnapshotStore<Snapshot<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>>[],
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
      analysisType: AnalysisTypeEnum.IMAGE,
      analysisResults: {} as DataAnalysisResult<T, K>[],
      tags: [],
      name: "Project A",
      description: "Description of Project A",
      members: [],
      tasks: [],
      videoData: {} as VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
      analysisType: AnalysisTypeEnum.IMAGE,
      analysisResults: {} as DataAnalysisResult<T, K>[],
      tags: [],
      name: "Project B",
      description: "Description of Project B",
      members: [],
      phases: [],
      currentPhase: "Planning" as unknown as Phase,
      videoUrl: "videoUrl",
      videoThumbnail: "videoThumbnail",
      videoDuration: 0,
      videoData: {} as VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
            callbackfn: (value: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, index: number, array: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => unknown,
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
    firstName: "Baine",
    lastName: "Sanders",
    token: null,
    avatarUrl: null,
    bio: "bio content",
    hasQuota: false,
    profilePicture: "profile picture",
    processingTasks: [] as DataProcessingTask[],
    traits: "traits" as unknown as typeof CommonDetails,
    role: UserRoles.Guest,
    timeBasedCode: timeBasedCode,
    persona: {} as Persona,
    members: [] as SnapshotStore<Snapshot<MemberEntity, MemberEntity, DefaultMeta<MemberEntity, MemberEntity>, never>, MemberEntity, DefaultMeta<MemberEntity, MemberEntity>, never>[],


     // Required additional props
  createdAt: new Date(),
  updatedAt: new Date(),
  isVerified: false,
  isActive: true,
  isAdmin: false,
  friends: [],
  blockedUsers: [],
  settings: null,
  projects: [],
  notifications: undefined,
  profileAccessControl: undefined,
  preferences: undefined,
  activityLog: [],
  skills: [],
  hobbies: [],
  achievements: [],
  profileVisibility: "",
  activityStatus: "",
  isAuthorized: true,
  roles: [UserRoles.Guest],
  },

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
      name: team.teamDetails.name, 
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
  videoData: {} as VideoData<AppTeamEntity TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>,
  percentage: 0,
  timestamp: undefined,
  category: "",
};