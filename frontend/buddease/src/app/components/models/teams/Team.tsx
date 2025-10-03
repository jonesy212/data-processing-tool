"use client";

import { FileTypeEnum } from "@/app/components/documents/FileType";
import { BaseData } from "@/app/data/Data";
import useFiltering from "@/app/hooks/useFiltering";
import { Project, reassignProject } from "@/app/models/projects/Project";
import generateTimeBasedCode from "@/app/models/realtime/TimeBasedCodeGenerator";
import { Progress } from "@/app/tracker/ProgressBar";
import dynamic from 'next/dynamic';
import React from "react";
import { TeamData } from "./TeamData";

import {
  LanguageEnum
} from "@/app/communications/LanguageEnum";
import { Attachment } from "@/app/components/documents/Attachment/attachment";
import { NotificationPreferenceEnum } from "@/app/components/notifications/Notification";
import { SearchOptions } from "@/app/pages/searchs/SearchOptions";
import { RealtimeDataItem } from "@/app/realtime/RealtimeData";
import { SortCriteria } from "@/app/settings/SortCriteria";
import { BaseDataEntity } from "@/app/snapshots/ValidationRule";
import { SubscriberCollection } from "@/app/users/SubscriberCollection";
import { DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";


type TeamEntity = BaseDataEntity;
type TeamK = TeamEntity;
type TeamMeta = DefaultMeta<TeamEntity, TeamK>;
type TeamExcludedFields = DefaultExcludedFields<TeamEntity>;

// Core snapshot types
type TeamSnapshot = Snapshot<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>;
type TeamSnapshotData = SnapshotData<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>;
type TeamSnapshotStore = SnapshotStore<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>;
type TeamSnapshotWithCriteria = SnapshotWithCriteria<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>;
type TeamSubscriberCollection = SubscriberCollection<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>;
type TeamRealtimeDataItem = RealtimeDataItem<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>;

// Config
type TeamSnapshotStoreConfig = SnapshotStoreConfig<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>;
type TeamSnapshotsArray = SnapshotsArray<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>;

// Params
type TeamParams = SnapshotConfigParams<TeamEntity, TeamK, TeamMeta, TeamExcludedFields>;

type TeamSnapshotFromParams<Params extends SnapshotConfigParams<any, any, any, any>> =
  Snapshot<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

type TeamSnapshotUnionFromParams<Params extends SnapshotConfigParams<any, any, any, any>> =
  SnapshotUnion<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;

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





// Client-side API calls
const updateProgress = async (teamId: string, projectUpdates?: Array<{
  projectId: string;
  status?: string;
  progress?: number;
}>) => {
  try {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teamId,
        projectUpdates
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update progress');
    }

    const result = await response.json();
    return result.progress;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};



// Dynamically import CommonDetails
const CommonDetails = dynamic(
  () =>  import("@/app/models/CommonData"),
  { ssr: false, loading: () => <div>Loading...</div> }
);


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
  T extends BaseDataEntity = TeamEntity,
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
  reassignProject(teamId: string, projectId: string, previousTeamId: string): Promise<void>;
  unassignProject(teamId: string, projectId: string): Promise<void>;
  updateProgress(teamId: string, projectUpdates?: Array<{
    projectId: string;
    status?: string;
    progress?: number;
  }>): Promise<number>;
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
    // ... (keep existing members array, but remove server dependencies)
  ],
  projects: [
    // ... (keep existing projects array, but remove server dependencies)
  ],
  creationDate: new Date(),
  progress: {} as Progress,
  isActive: true,
  leader: {
    // ... (keep existing leader object, but remove server dependencies)
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

  reassignProject: async (teamId: string, projectId: string, previousTeamId: string): Promise<void> => {
    await reassignProject(teamId, projectId, previousTeamId);
  },

  updateProgress: async (teamId: string, projectUpdates?: Array<{
    projectId: string;
    status?: string;
    progress?: number;
  }>): Promise<number> => {
    return await updateProgress(teamId, projectUpdates);
  }
};



const TeamDetails: React.FC<{ team: Team }> = ({ team }) => {
  // Check if team is not undefined before passing it to CommonDetails
  const data: CommonData<TeamEntity, TeamEntity, TeamMeta, never> | undefined =
  team ? { ...team, completed: true } : undefined;

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

