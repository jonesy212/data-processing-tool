// TeamManagerStore.tsx
import { useState } from "react";
import { Team } from "../../models/teams/Team";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

import { generateNewTeam } from "@/app/generators/GenerateNewTask";
import { makeAutoObservable } from "mobx";
import {
  AssignTeamMemberStore,
  useAssignTeamMemberStore,
} from "./AssignTeamMemberStore";
import SnapshotStore from "./SnapshotStore";

export interface TeamManagerStore {
  teams: Record<string, Team[]>;
  teamName: string;
  teamDescription: string;
  teamStatus: "active" | "inactive" | "archived";
  assignedTeamMemberStore: AssignTeamMemberStore;
  updateTeamName: (name: string) => void;
  updateTeamDescription: (description: string) => void;
  updateTeamStatus: (status: "active" | "inactive" | "archived") => void;
  addTeamSuccess: (payload: { team: Team }) => void;
  addTeam: (team: Team) => void;
  addTeams: (teams: Team[]) => void;
  removeTeam: (teamId: string) => void;
  removeTeams: (teamIds: string[]) => void;
  fetchTeamsSuccess: (payload: { teams: Team[] }) => void;
  fetchTeamsFailure: (payload: { error: string }) => void;
  fetchTeamsRequest: () => void;
  completeAllTeamsSuccess: () => void;
  completeAllTeams: () => void;
  completeAllTeamsFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  setDynamicNotificationMessage: (message: string) => void;
  snapshotStore: SnapshotStore<Record<string, Team[]>>; // Include a SnapshotStore for teams
  takeTeamSnapshot: (teamId: string, userIds: string[]) => void;

  // Add more methods or properties as needed
}

const useTeamManagerStore = (): TeamManagerStore => {
  const [teams, setTeams] = useState<Record<string, Team[]>>({
    active: [],
    inactive: [],
    archived: [],
  });
  const [teamName, setTeamName] = useState<string>("");
  const [teamDescription, setTeamDescription] = useState<string>("");
  const [teamStatus, setTeamStatus] = useState<
    "active" | "inactive" | "archived"
  >("active");
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>(""); // Initialize it with an empty string

  // Include the AssignTeamMemberStore
  const assignedTeamMemberStore = useAssignTeamMemberStore();
  // Initialize SnapshotStore
  const initialSnapshot = {};
  const snapshotStore = new SnapshotStore(initialSnapshot);

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

  const takeTeamSnapshot = (teamId: string, userIds?: string[]) => {
    // Ensure the teamId exists in the teams
    if (!teams[teamId]) {
      console.error(`Team with ID ${teamId} does not exist.`);
      return;
    }

    // Create a snapshot of the current teams for the specified teamId
    const teamSnapshot = { [teamId]: [...teams[teamId]] };

    // Store the snapshot in the SnapshotStore
    snapshotStore.takeSnapshot(teamSnapshot);

    if (userIds) {
      const teamAssignmentsSnapshot = {
        [teamId]: [
          ...assignedTeamMemberStore.getAssignedTeamMembers(teamId, userIds),
        ],
      };
      snapshotStore.takeSnapshot(teamAssignmentsSnapshot);
    }
  };

  const addTeam = () => {
    // Ensure the name is not empty before adding a team
    if (teamName.trim().length === 0) {
      console.error("Team name cannot be empty.");
      return;
    }
    // Ensure the name is not empty before adding a team
    if (teamName.trim().length === 0) {
      console.error("Team name cannot be empty.");
      return;
    }

    generateNewTeam().then((newTeam: Team) => {
      setTeams((prevTeams) => ({
        ...prevTeams,
        [newTeam.id]: [...(prevTeams[newTeam.id] || []), newTeam],
      }));

      // Reset input fields after adding a team
      setTeamName("");
      setTeamDescription("");
      setTeamStatus("active");
    });

    // Reset input fields after adding a team
    setTeamName("");
    setTeamDescription("");
    setTeamStatus("active");
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
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.DataLoading.PAGE_LOADING
    );
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

  makeAutoObservable({
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
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    setDynamicNotificationMessage,
  });

  return {
    teams,
    ...teams,
    teamName,
    teamDescription,
    teamStatus,
    assignedTeamMemberStore,
    snapshotStore,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    addTeamSuccess,
    updateTeamName,
    updateTeamDescription,
    updateTeamStatus,
    addTeam,
    addTeams,
    removeTeam,
    removeTeams,
    takeTeamSnapshot,
    fetchTeamsSuccess,
    fetchTeamsFailure,
    fetchTeamsRequest,
    completeAllTeamsSuccess,
    completeAllTeams,
    completeAllTeamsFailure,
    setDynamicNotificationMessage,
    // Add more methods or properties as needed
  };
};

export { useTeamManagerStore };
