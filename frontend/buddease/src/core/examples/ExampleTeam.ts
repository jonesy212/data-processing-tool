// ExampleTeam.ts
import { UserSettings } from '@/core/config/UserSettings';
import { assignProject, Project, reassignProject, unassignProject } from '@/core/models/projects/Project';
import { TeamData } from '@/core/models/teams/TeamData';
import { Progress } from '@/core/models/tracker/ProgressBar';
import { UserRole } from '@/core/models/UserRole';
import UserRoles from '@/core/models/UserRoles';
import { Persona } from '@/core/pages/personas/Persona';
import { ProfileAccessControl } from '@/core/pages/profile/Profile';
import { DataProcessingTask } from '@/core/todos/tasks/DataProcessingTask';
import type { AnalysisTypeEnum } from '@/core/typings/AnalysisType';
import type { AppTeamEntity, TeamAttachment, TeamEntity, TeamExcludedFields, TeamIncludedFields, TeamK, TeamMeta } from '@/core/typings/entities/TeamEntity';
import { VideoData } from '@/core/typings/videoTypes/Video';
import { Settings } from '@/core/state/hybrid/SettingsManagerStore';

import type { CodingLanguageEnum, LanguageEnum } from '@/core/communications/LanguageEnum';
    CodingLanguageEnum,
    LanguageEnum,
} from '@/core/communications/LanguageEnum';
import type { DefaultMeta } from '@/core/config/BaseConfig';
import { ThemeEnum } from '@/core/libraries/ui/theme/Theme';

import { updateProgress } from '@/core/components/calendar/CalendarApp';
import { CommonDetails } from '@/core/components/models/details/CommonDetails';
import { Team } from '@/core/components/teams/Team';
import { options } from '@/core/generators/GenerateUniqueIds';
import { useFiltering } from '@/core/hooks/useFiltering';
import generateTimeBasedCode from '@/core/models/realtime/TimeBasedCodeGenerator';
import { Snapshots } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import type { MemberAttachment, MemberEntity, MemberExcludedFields, MemberIncludedFields, MemberK, MemberMeta } from '@/core/typings/entities/MemberEntity';
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
          animateIn: () => { },
          startAnimation: () => { },
          stopAnimation: () => { },
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
    videoData: {} as VideoData<AppTeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields >,
    percentage: 0,
    timestamp: undefined,
    category: "",
    }
  ]
}