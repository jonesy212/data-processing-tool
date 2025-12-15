// TeamDetailsComponent.tsx
"use client";

import { FileTypeEnum } from "@/app/documents/FileType";
import useFiltering from "@/app/hooks/useFiltering";
import { CommonData } from "@/app/models/CommonData";
import { BaseData } from '@/app/models/data/Data';
import { Project } from "@/app/models/projects/Project";
import generateTimeBasedCode from "@/app/models/realtime/TimeBasedCodeGenerator";
import dynamic from 'next/dynamic';
import React from "react";

import {
    LanguageEnum
} from "@/app/communications/LanguageEnum";
import { NotificationPreferenceEnum } from "@/app/components/notifications/Notification";
import { SearchOptions } from "@/app/pages/searches/SearchOptions";
import { SortCriteria } from "@/app/settings/SortCriteria";
import { TeamAttachment, TeamEntity, TeamExcludedFields, TeamIncludedFields, TeamK, TeamMeta } from '@/app/typings/entities/teamTypes';

const options: SearchOptions = {
  communicationMode: "email", // Example communication mode
  size: "medium",
  mode: 'ui',
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



const timeBasedCode = generateTimeBasedCode();



const TeamDetails: React.FC<{ team: Team }> = ({ team }) => {
  // Check if team is not undefined before passing it to CommonDetails
  const data: CommonData<TeamEntity, TeamK, TeamMeta, TeamAttachment, TeamExcludedFields, TeamIncludedFields>| undefined =
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

