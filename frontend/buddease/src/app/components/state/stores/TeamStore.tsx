// TeamManagerStore.tsx
import { useState } from "react";
import { Team } from "../../models/teams/Team";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

import { videoService } from "@/app/api/ApiVideo";
import teamManagementService from "@/app/api/TeamManagementApi";
import { useNotification } from "@/app/components/support/NotificationContext";
import { makeAutoObservable } from "mobx";
import { Data } from "../../models/data/Data";
import TeamData from "../../models/teams/TeamData";
import { Phase } from "../../phases/Phase";
import { Project } from "../../projects/Project";
import SnapshotStoreConfig, { SnapshotStoreConfig } from "../../snapshots/SnapshotConfig";
import SnapshotStore, { Snapshot } from "../../snapshots/SnapshotStore";
import {
  NotificationType,
  NotificationTypeEnum,
} from "../../support/NotificationContext";
import userService from "../../users/ApiUser";
import { VideoData } from "../../video/Video";
import { useAssignBaseStore } from "../AssignBaseStore";
import {
  AssignTeamMemberStore,
  useAssignTeamMemberStore,
} from "./AssignTeamMemberStore";
import useVideoStore from "./VideoStore";

interface CustomData extends Data {
  _id: string;
  id: number;
  title: string;
  status: "pending" | "inProgress" | "completed";
  isActive: boolean;
  tags: string[];
  phase: Phase | null;
  // Add other properties as needed to match the structure of Data
}

export interface TeamManagerStore {
  teams: Record<string, Team[]>;
  teamName: string;
  teamDescription: string;
  teamStatus: "active" | "inactive" | "archived";

  assignedTeamMemberStore: AssignTeamMemberStore;

  updateTeamData: (teamId: number, data: Team) => void;
  updateTeamName: (name: string) => void;
  updateTeamDescription: (description: string) => void;
  updateTeamStatus: (status: "active" | "inactive" | "archived") => void;

  addTeamSuccess: (payload: { team: Team }) => void;
  addTeam: (team: Team) => void;
  addTeams: (teams: Team[]) => void;

  removeTeam: (teamId: string) => void;
  removeTeams: (teamIds: string[]) => void;

  getTeamData: (teamId: string, team: Team) => Team | null;
  getTeamsData: (teamId: string, team: Team[]) => Team[] | null;
  fetchTeamsSuccess: (payload: { teams: Team[] }) => void;
  fetchTeamsFailure: (payload: { error: string }) => void;
  fetchTeamsRequest: () => void;
  completeAllTeamsSuccess: () => void;
  completeAllTeams: () => void;
  completeAllTeamsFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  setDynamicNotificationMessage: (message: string) => void;
  snapshotStore: SnapshotStore<Snapshot<Data>>; // Include a SnapshotStore for teams
  takeTeamSnapshot: (teamId: string, userIds: string[]) => void;
  getTeamId: (
    teamId: Team["id"],
    team: Team,
  ) => number;
  // Add more methods or properties as needed
}
const config = {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>;
const useTeamManagerStore = async (): Promise<TeamManagerStore> => {
  const { notify } = useNotification();

  const [teams, setTeams] = useState<Record<string, Team[]>>({
    active: [],
    inactive: [],
    archived: [],
  });
  // const [teamData, setTeamData] = useState<Record<string, TeamData>>({});
  const [teamName, setTeamName] = useState<string>("");
  const [teamDescription, setTeamDescription] = useState<string>("");
  const [teamStatus, setTeamStatus] = useState<
    "active" | "inactive" | "archived"
  >("active");
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>(""); // Initialize it with an empty string

  // Include the AssignTeamMemberStore
  const assignedTeamMemberStore = useAssignTeamMemberStore();
  // Initialize SnapshotStore
  const initSnapshot = {} as SnapshotStoreConfig<
    SnapshotStore<Snapshot<Data>>
  >;
  const snapshotStore = new SnapshotStore(initSnapshot,
    config,
    () => {
    notify(
      "initSnapshot",
      "Initial Snapshot has been taken.",
      NOTIFICATION_MESSAGES.Data.PAGE_LOADING,
      new Date(),
      NotificationTypeEnum.Info
    );
  });

  const updateTeamName = (name: string) => {
    setTeamName(name);
  };

  const updateTeamDescription = (description: string) => {
    setTeamDescription(description);
  };

  const updateTeamStatus = (status: "active" | "inactive" | "archived") => {
    setTeamStatus(status);
  };

  const addTeamSuccess = (payload: { team: Team }) => {
    const { team } = payload;
    setTeams((prevTeams) => {
      const teamId = team.id;
      return { ...prevTeams, [teamId]: [...(prevTeams[teamId] || []), team] };
    });
  };

  const getTeamId = (teamId: string, team: Team) => {
    // Convert teamId to a number if necessary
    return parseInt(teamId, 10);
  };
  

  const getTeamData = (teamId: string, data: TeamData) => {
    const teamData: Team = {
      id: teamId,
      team: { value: 0, label: data.teamName }, // Assuming 'teamName' maps to 'label' property in 'Team' type
      description: data.description,
      members: data.members || [],
      projects: data.projects,
      creationDate: data.creationDate,
      isActive: data.isActive,
      _id: "",
      teamName: "",
      leader: null,
      progress: null,
      assignedProjects: [],
      reassignedProjects: [],
      assignProject: function (team: Team, project: Project): void {
        team.assignedProjects.push(project);

      },
      reassignProject: function (team: Team, project: Project, previousTeam: Team, reassignmentDate: Date): void {
        team.assignedProjects.push(project);
            },
      unassignProject: function (team: Team, project: Project): void {
        team.assignedProjects = team.assignedProjects.filter(p => p !== project);
            },
      updateProgress: function (team: Team, project: Project): void {
        team.progress = project.progress;

            }
    };
    return teamData;
  };

  const getTeamsData = (teamId: string, data: TeamData[]): Team[] => {
    // Retrieve the team corresponding to the provided teamId
    const team = teams[teamId];
    if (!team) {
      // Return an empty array if the team is not found
      return [];
    }

    // Combine team data with additional data
    const teamsData = team.map((teamItem) => {
      // Find the matching data for the team
      // (i.e. the data that was passed in)
      // convert item.id and teamItem.id to as string
      const matchingData = data.find(
        (item) => item.id.toString() === teamItem.id.toString()
      );
      if (!matchingData) {
        // Handle case where data for a team is missing
        console.error(`Data not found for team with id ${teamItem.id}`);
        return teamItem;
      }
      // Return combined team data
      return {
        ...teamItem,
        ...matchingData,
      };
    });

    // Filter out any null values
    const filteredTeamsData = teamsData.filter(Boolean);

    return filteredTeamsData as Team[];
  };
  

  const takeTeamSnapshot = async (teamId: string, userIds?: string[]) => {
    // Ensure the teamId exists in the teams
    if (!teams[teamId]) {
      console.error(`Team with ID ${teamId} does not exist.`);
      return;
    }
    const snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>> = {} as SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>

    // Create a snapshot of the current teams for the specified teamId
    const teamSnapshot = new SnapshotStore<Snapshot<Data>>(snapshotConfig, () =>
      notify(
        "Snapshot taken for team " + teamId,
        "teamSnapshot",
        "Team Snapshot has been taken.",
        new Date(),
        "TeamSnapshot" as NotificationType
      )
    );

    // Store the snapshot in the SnapshotStore
    snapshotStore.takeSnapshot(teamSnapshot);

    if (userIds) {
      const videos: VideoData[] = [];
      let videoData: Record<string, VideoData> = {};
      const videosDataPromise: Promise<Record<string, VideoData>> =
        useVideoStore().getVideosData(userIds, videos);
      userIds.forEach(async (userId) => {
        const videoPromise = new Promise<VideoData>(
          async (resolve, reject) => {
            const videoStore = useVideoStore();
            const user = await userService.fetchUserById(userId);
            const video = await videoService.fetchVideoByUserId(userId);
            if (video && video.length > 0) {
              const videoDataForUser = videoStore.getVideoData(userId, video[0]);
              if (videoDataForUser) {
                resolve(videoDataForUser);
              } else {
                reject(new Error("No video data found for user"));
              }
            } else {
              reject(new Error("No video found for user"));
            }
          }
        );
        videos.push(await videoPromise);
      });

      videoData = await videosDataPromise;
      const teamAssignmentsSnapshot: SnapshotStore<Snapshot<Data>> = {} as SnapshotStore<Snapshot<Data>>
      snapshotStore.takeSnapshot(teamAssignmentsSnapshot);
    }
  }

  const addTeam = async () => {
    // Ensure the name is not empty before adding a team
    if (teamName.trim().length === 0) {
      console.error("Team name cannot be empty.");
      return;
    }
    if (teamName.trim().length > 0) {
      try {
        const newTeam = await teamManagementService.createTeam({
          name: teamName,
          description: teamDescription,
          status: teamStatus
        });
        setTeams((prevTeams) => {
          const updatedTeams = { ...prevTeams };
          updatedTeams[newTeam.id] = [newTeam];
          return updatedTeams;
        });
        // Add team snapshot to snapshot store  
        snapshotStore.takeSnapshot(newTeam);
        // Reset input fields after adding a team
        setTeamName("");
        setTeamDescription("");
        setTeamStatus("active");
      } catch (error) {
        console.error("Error creating team:", error);
      }
    }
  };

  const removeTeam = (teamId: string) => {
    setTeams((prevTeams: Record<string, Team[]>) => {
      const updatedTeams = { ...prevTeams };
      delete updatedTeams[teamId];
      return updatedTeams;
    });
  };

  const removeTeams = (teamIds: string[]) => {
    setTeams((prevTeams) => {
      const updatedTeams = { ...prevTeams };
      teamIds.forEach((teamId) => {
        delete updatedTeams[teamId];
      });
      return updatedTeams;
    });
  };

  const addTeams = (teamsToAdd: Team[]) => {
    // Ensure at least one team is passed
    if (teamsToAdd.length === 0) {
      console.error("At least one team must be passed");
      return;
    }

    setTeams((prevTeams) => {
      teamsToAdd.forEach((team) => {
        const teamId = team.id;
        prevTeams[teamId] = [...(prevTeams[teamId] || []), team];
      });
      return prevTeams;
    });

    // Reset input fields after adding teams
    setTeamName("");
    setTeamDescription("");
    setTeamStatus("active");
  };

  const updateTeamData = (teamId: number, data: Team) => {
    const updatedTeams = { ...teams };

    // Check if the teamId exists in updatedTeams
    if (updatedTeams[teamId]) {
      // Assuming data contains some of the properties of Team
      if (data.id === undefined) {
        console.error(`Team with ID ${teamId} not found.`);
        return; // Handle the case where id is undefined
      }

      updatedTeams[teamId] = [...teams[teamId], { ...data }];
      setTeams(updatedTeams);
    } else {
      console.error(`Team with ID ${teamId} not found.`);
    }
  };

  const fetchTeamsSuccess = (payload: { teams: Team[] }) => {
    const { teams: newTeams } = payload;
    setTeams((prevTeams) => {
      const updatedTeams = { ...prevTeams };

      newTeams.forEach((team) => {
        if (!prevTeams[team.id]) {
          prevTeams[team.id] = [];
        }
        prevTeams[team.id].push(team);
      });

      return updatedTeams;
    });
  };

  const completeAllTeamsSuccess = () => {
    console.log("All Teams completed successfully!");
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };

  const completeAllTeams = () => {
    console.log("Completing all Teams...");
    // You can add loading indicators or other UI updates here

    // Simulate asynchronous completion
    setTimeout(() => {
      // Update teams to mark all as done
      setTeams((prevTeams: Record<string, Team[]>) => {
        const updatedTeams = { ...prevTeams };
        Object.keys(updatedTeams).forEach((id) => {
          updatedTeams[id] = prevTeams[id].map((team) => ({
            ...team,
            done: true,
          }));
        });
        return updatedTeams;
      });

      // Trigger success
      completeAllTeamsSuccess();
    }, 1000);
  };

  const fetchTeamsFailure = (payload: { error: string }) => {
    console.error("Fetch Teams Failure:", payload.error);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA
    );
  };

  const fetchTeamsRequest = () => {
    console.log("Fetching Teams...");
    // You can add loading indicators or other UI updates here
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Data.PAGE_LOADING);
  };

  const completeAllTeamsFailure = (payload: { error: string }) => {
    console.error("Complete All Teams Failure:", payload.error);
    // You can add additional error handling or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH);
  };

  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setNotificationMessage(message);
  };

  // Add more methods or properties as needed

  const useTeamManagerStore = makeAutoObservable({
    teams,
    ...teams,
    teamName,
    teamDescription,
    teamStatus,
    assignedTeamMemberStore,
    updateTeamName,
    updateTeamDescription,
    updateTeamStatus,
    addTeam,
    addTeams,
    removeTeam,
    removeTeams,
    addTeamSuccess,
    fetchTeamsSuccess,
    fetchTeamsFailure,
    fetchTeamsRequest,
    completeAllTeamsSuccess,
    completeAllTeams,
    completeAllTeamsFailure,
    setDynamicNotificationMessage,
    getTeamId,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    updateTeamData,
    takeTeamSnapshot,
    snapshotStore: snapshotStore,
    getTeamsData,
    getTeamData,
    assignedProjects: useAssignBaseStore().assignProjectToTeam,
  });

  return useTeamManagerStore;
};

export { useTeamManagerStore };

  export type { CustomData };

