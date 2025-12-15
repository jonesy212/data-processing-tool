// Team.tsx
"use client";
import { LanguageEnum } from "@/app/communications/LanguageEnum";
import { NotificationPreferenceEnum } from "@/app/components/notifications/Notification";
import { DefaultExcludedFields, DefaultMeta } from "@/app/config/BaseConfig";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { FileTypeEnum } from "@/app/documents/FileType";
import useFiltering from "@/app/hooks/useFiltering";
import { CommonData } from "@/app/models/CommonData";
import { BaseData } from "@/app/models/data/Data";
import { Project, reassignProject } from "@/app/models/projects/Project";
import generateTimeBasedCode from "@/app/models/realtime/TimeBasedCodeGenerator";
import { TeamData } from "@/app/models/teams/TeamData";
import { Progress } from "@/app/models/tracker/ProgressBar";
import { SearchOptions } from "@/app/pages/searches/SearchOptions";
import { SortCriteria } from "@/app/settings/SortCriteria";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { BaseDataEntity } from "@/app/snapshots/ValidationRule";
import {
  AppTeamEntity,
  TeamAttachment,
  TeamExcludedFields,
  TeamIncludedFields,
  TeamK,
  TeamMeta,
} from "@/app/typings/entities/TeamEntity";
import dynamic from "next/dynamic";
import React from "react";

const options: SearchOptions = {
  communicationMode: "email", // Example communication mode
  size: "medium",
  mode: "team",
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

// Client-side API calls
const updateProgress = async (
  teamId: string,
  projectUpdates?: Array<{
    projectId: string;
    status?: string;
    progress?: number;
  }>
) => {
  try {
    const response = await fetch("/api/teams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamId,
        projectUpdates,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update progress");
    }

    const result = await response.json();
    return result.progress;
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
};

// Dynamically import CommonDetails
const CommonDetails = dynamic(() => import("@/app/models/CommonData"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

// Initialize the useFiltering hook with the provided options
const { addFilter } = useFiltering(options);

interface ReassignedProject {
  getData: () => Promise<SnapshotStore<BaseData>[]>;
  projectId: string;
  timestamp?: Date;
  category: string;
  project: Project | undefined;
  projectName: Project["name"];
  previousTeam: Team;
  reassignmentDate: Date;
}

interface Team<
  T extends BaseDataEntity = AppTeamEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = TeamMeta,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  teamDetails: {
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

  // Client-side only methods (call API endpoints)
  assignProject(teamId: string, projectId: string): Promise<void>;
  reassignProject(
    teamId: string,
    projectId: string,
    previousTeamId: string
  ): Promise<void>;
  unassignProject(teamId: string, projectId: string): Promise<void>;
  updateProgress(
    teamId: string,
    projectUpdates?: Array<{
      projectId: string;
      status?: string;
      progress?: number;
    }>
  ): Promise<number>;
}

const timeBasedCode = generateTimeBasedCode();
// Example usage with client-side only implementation
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
      snapshots: [] as Snapshots<
        TeamEntity,
        TeamK,
        TeamMeta,
        TeamExcludedFields
      >,
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

      // CORRECTED: All settings-related properties are now inside settings object
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
            this.idleTimeout.idleTimeoutId = setTimeout(
              onTimeout,
              timeoutDuration
            );
          },
          toggleActivation: async () => false,
        },

        // MOVED: All these properties were at wrong level, now properly in settings
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

        // MOVED: filter function now properly inside settings
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
    // ... rest of members array
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
      videoData: {} as VideoData<
        T,
        K,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >,
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
      videoData: {} as VideoData<
        T,
        K,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >,
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
          data: {} as Data<
            T,
            K,
            Meta,
            AttachmentType,
            ExcludedFields,
            IncludedFields
          >,
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
            callbackfn: (
              value: Task<
                T,
                K,
                Meta,
                AttachmentType,
                ExcludedFields,
                IncludedFields
              >,
              index: number,
              array: Task<
                T,
                K,
                Meta,
                AttachmentType,
                ExcludedFields,
                IncludedFields
              >[]
            ) => unknown,
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
    members: [] as SnapshotStore<
      Snapshot<
        MemberEntity,
        MemberEntity,
        DefaultMeta<MemberEntity, MemberEntity>,
        never
      >,
      MemberEntity,
      DefaultMeta<MemberEntity, MemberEntity>,
      never
    >[],

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
  data: {} as TeamData & Team,
  assignedProjects: [],
  reassignedProjects: [],

  // Client-side API implementations
  assignProject: async (teamId: string, projectId: string): Promise<void> => {
    await assignProject(teamId, projectId);
  },

  unassignProject: async (teamId: string, projectId: string): Promise<void> => {
    await unassignProject(teamId, projectId);
  },

  reassignProject: async (
    teamId: string,
    projectId: string,
    previousTeamId: string
  ): Promise<void> => {
    await reassignProject(teamId, projectId, previousTeamId);
  },

  updateProgress: async (
    teamId: string,
    projectUpdates?: Array<{
      projectId: string;
      status?: string;
      progress?: number;
    }>
  ): Promise<number> => {
    return await updateProgress(teamId, projectUpdates);
  },
};

const TeamDetails: React.FC<{
  team: Team<
    AppTeamEntity,
    TeamK,
    TeamMeta,
    TeamAttachment,
    TeamExcludedFields,
    TeamIncludedFields
  >;
}> = ({ team }) => {
  // Pass all 6 generic parameters to CommonData
  const data:
    | CommonData<
        AppTeamEntity,
        TeamK,
        TeamMeta,
        TeamAttachment,
        TeamExcludedFields,
        TeamIncludedFields
      >
    | undefined = team ? { ...team, completed: true } : undefined;

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
        latestVersion: team.latestVersion,
        date: team.date,
        createdBy: team.createdBy,
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

export { team, TeamDetails };
export type { Team };

