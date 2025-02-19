import {UndoRedoStore, useUndoRedoStore}  from './UndoRedoStore';
// HistoryStore.ts
import { getUsersData, saveUserProfiles } from "@/app/api/UsersApi";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Import UUID library for generating unique IDs
import { authToken } from "../../auth/authToken";
import useDataExport from "../../hooks/dataHooks/useDataExport";
import UserService from "../../users/ApiUser";
import { useSecureUserId } from "../../utils/useSecureUserId";
import { TaskHistoryEntry } from "../../interfaces/history/TaskHistoryEntry";

interface BaseHistoryStore {
  clearHistory: () => void;
  limitHistoryEntries: (limit: number) => void;
  formatTimestamp: (timestamp: number) => string;
  filterHistory: (criteria: string) => HistoryEntry[];
  exportHistory: () => void;
  importHistory: (data: HistoryEntry[]) => void;
  navigateHistory: (direction: "backward" | "forward") => void;
  persistHistory: () => void;
  customizeHistoryDisplay: (options: any) => void;
  collapseHistorySections: (section: any) => void;
  searchHistory: (query: string) => void;
  integrateWithUserProfiles: () => void;
  addToClipboardHistory: (copiedText: any) => void;
  undoHistory: () => void;
  redoHistory: () => void;
}

interface HistoryEntry {
  id: string;
  timestamp: number;
  data: any; // Data representing the state or action captured in the history entry
  changes: string[];
}

interface HistoryStore {
  history: HistoryEntry[] | undefined;
  addHistoryEntry: (data: any) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  limitHistoryEntries: (limit: number) => void;
  formatTimestamp: (timestamp: number) => string;
  filterHistory: (criteria: string) => HistoryEntry[];
  exportHistory: () => void;
  importHistory: (data: HistoryEntry[]) => void;

  navigateHistory: (direction: "backward" | "forward") => void;
  persistHistory: () => void;
  customizeHistoryDisplay: (options: any) => void;
  collapseHistorySections: (section: any) => void;
  searchHistory: (query: string) => void;
  integrateWithUserProfiles: () => void;
  addToClipboardHistory: (copiedText: any) => void;
  getTaskHistory: (taskId: number) => Promise<TaskHistoryEntry[]>;
  addTaskHistoryEntry: (taskId: number, action: string) => void;
}

export const baseStore = (): BaseHistoryStore => {
  const clearHistory = () => {
    // Implement clearHistory logic here
  };

  const limitHistoryEntries = (limit: number) => {
    // Implement limitHistoryEntries logic here
  };

  const formatTimestamp = (timestamp: number) => {
    // Implement formatTimestamp logic here
    return "";
  };

  const filterHistory = (criteria: string): HistoryEntry[] => [];

  const exportHistory = () => {
    // Implement exportHistory logic here
  };

  const importHistory = () => {
    // Implement importHistory logic here
  };


  const navigateHistory = (direction: "backward" | "forward") => {
    // Use the useUndoRedoStore hook for undo/redo actions based on direction
    const store = useUndoRedoStore();
    if (direction === "backward") {
      store.undo();
    } else {
      store.redo();
    }
  };


  const persistHistory = () => {
    // Implement persistHistory logic here to save history to localStorage/indexedDB
    localStorage.setItem("history", JSON.stringify(history));
  };

  const undoHistory = () => {
    useUndoRedoStore().undo();
  };

  const redoHistory = () => {
    useUndoRedoStore().redo();
  };

  return {
    clearHistory,
    limitHistoryEntries,
    formatTimestamp,
    filterHistory,
    exportHistory,
    importHistory,
    navigateHistory,
    persistHistory,
    undoHistory,
    redoHistory,
    customizeHistoryDisplay: () => {},
    collapseHistorySections: () => {},
    searchHistory: () => {},
    integrateWithUserProfiles: () => {},
    addToClipboardHistory: () => {},
  };
};

const historyManagerStore = (): HistoryStore => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const undoRedoStore = useUndoRedoStore(); // Use the hook to get the undoRedoStore instance

  const addHistoryEntry = (data: any) => {
    // Add a new history entry with a unique ID and timestamp
    const newEntry: HistoryEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      data: data,
      changes: []
    };
    setHistory([...history, newEntry]);
  };

  const undo = () => {
    if (history.length > 0) {
      // Remove the last history entry to undo the last action
      const updatedHistory = [...history];
      updatedHistory.pop();
      setHistory(updatedHistory);
    }
  };

  const redo = () => {
    // Call the redo method from the UndoRedoStore
    undoRedoStore.redo();
  };

  const clearHistory = () => {
    // Clear the entire history
    setHistory([]);
  };

  // Additional actions implementations
  const limitHistoryEntries = (limit: number) => {
    setHistory(history.slice(-limit));
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const filterHistory = (criteria: string) => {
    return history.filter((entry) => entry.data.includes(criteria));
  };

  // Use the useRealtimeData hook in exportHistory function
  const exportHistory = () => {
    try {
      const jsonHistory = JSON.stringify(history);
      console.log("History data exported successfully:", jsonHistory);

      // Export history data to the server in real-time using useRealtimeData hook
      const { exportData } = useDataExport();
      exportData(jsonHistory);
    } catch (error) {
      console.error("Error exporting history data:", error);
      // Handle any errors that occur during export
    }
  };

  const importHistory = (data: HistoryEntry[]) => {
    try {
      // Validate the imported data format if needed
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid history data format.");
      }
      // Set the imported history data to the state
      setHistory(data);
      console.log("History data imported successfully.");
      // You can perform additional actions after importing, if necessary
    } catch (error) {
      console.error("Error importing history data:", error);
      // Handle any errors that occur during import
    }
  };

  const navigateHistory = async (direction: "backward" | "forward") => {
    try {
      if (direction === "backward") {
        undoRedoStore.undo(); // Undo the last action using UndoRedoStore
        console.log("Navigating backward in history...");
      } else if (direction === "forward") {
        undoRedoStore.redo(); // Redo the last undone action using UndoRedoStore
        console.log("Navigating forward in history...");
      } else {
        throw new Error("Invalid direction for navigating history.");
      }
    } catch (error) {
      console.error("Error navigating history:", error);
      // Handle any errors that occur during navigation
    }
  };
  const persistHistory = () => {
    try {
      // Convert the history data to a JSON string
      const historyJSON = JSON.stringify(history);

      // Save the history data to local storage
      localStorage.setItem("history", historyJSON);

      console.log("History data persisted to local storage.");
    } catch (error) {
      console.error("Error persisting history:", error);
      // Handle any errors that occur during persistence
    }
  };

  const customizeHistoryDisplay = (options: any) => {
    try {
      // Implement logic to customize the display of history data based on the provided options
      console.log("Customizing history display with options:", options);
    } catch (error) {
      console.error("Error customizing history display:", error);
      // Handle any errors that occur during customization
    }
  };

  const collapseHistorySections = function collapseHistorySections(
    section: any
  ) {
    // Implement logic to collapse the history section
    // For example, toggle a 'collapsed' property or modify its content
    if (section && section.content) {
      section.collapsed = true;
      section.content = ""; // Clear content or hide it
    }
  };

  const searchHistory = function searchHistory(section: any) {
    // Implement logic to search within the history section
    // For example, search for keywords in the section's content
    if (section && section.content) {
      // Perform search operations based on the content
      const searchTerm = "keyword"; // Example search term
      const found = section.content.includes(searchTerm);
      return found;
    }
    return false;
  };

  const integrateWithUserProfiles = async function integrateWithUserProfiles() {
    try {
      // Implement logic to integrate data with user profiles
      // Set user id
      const userId = useSecureUserId.toString();
      const userIds: string[] = [];

      // For example, fetch user profiles and update them with relevant data
      const userProfilesPromise = getUsersData(userIds);

      // Fetch new data for the user
      const newData = await UserService.fetchUser(userId, authToken);

      // Wait for user profiles and new data to resolve
      const [userProfiles] = await Promise.all([userProfilesPromise]);

      if (userProfiles) {
        // Update user profiles with new data
        const updatedUserProfiles = userProfiles.map((profile) => ({
          userId: profile.userId,
          username: profile.username,
          email: profile.email,
          tier: profile.tier,
          token: profile.token,
          uploadQuota: profile.uploadQuota,
          avatarUrl: profile.avatarUrl,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
          fullName: profile.fullName,
          isVerified: profile.isVerified,
          isAdmin: profile.isAdmin,
          isActive: profile.isActive,
          bio: profile.bio,
          userType: profile.userType,
          hasQuota: profile.hasQuota,
          profilePicture: profile.profilePicture,
          processingTasks: profile.processingTasks,
          role: profile.role,
          persona: profile.persona,
          data: profile.data,
          blockedUsers: profile.blockedUsers,
          firstName: profile.firstName,
          lastName: profile.lastName,
          friends: profile.friends,
          settings: profile.settings,

          interests: profile.interests,
          privacySettings: profile.privacySettings,
          followers: profile.followers, 
          notifications: profile.notifications, 
          preferences: profile.preferences,
          activityLog: profile.activityLog,

          socialLinks: profile.socialLinks,
          relationshipStatus: profile.relationshipStatus,
          hobbies: profile.hobbies,
          skills: profile.skills,

          achievements: profile.achievements,
          profileVisibility: profile.profileVisibility,
          profileAccessControl: profile.profileAccessControl,
          activityStatus: profile.activityStatus,
          isAuthorized: profile.isAuthorized,
          bannerUrl: profile.bannerUrl,
          roles: profile.roles,
          storeId: profile.storeId,
          currentMetadata: profile.currentMetadata, 
          currentMeta: profile.currentMeta
          // Add more properties as needed
        }));

        updatedUserProfiles.forEach((profile) => {
          profile.data = newData;
          // Additional logic for updating profiles as needed
        });

        // Save updated user profiles
        await saveUserProfiles(updatedUserProfiles); // Example function to save user profiles
      }
    } catch (error) {
      console.error("Error integrating with user profiles:", error);
      // Handle error as needed
    }
  };

  const addToClipboardHistory = async () => {
    try {
      // Add current history to clipboard
      await navigator.clipboard.writeText(JSON.stringify(history));
      // Copy history JSON to clipboard successfully
      console.log("History copied to clipboard");
      // Handle any errors that occur during clipboard operation
    } catch (error: any) {
      console.error("Error adding history to clipboard:", error);
      throw error;
    }
  };

  const historyStore: HistoryStore = makeAutoObservable({
    history: [],
    addHistoryEntry: historyManagerStore().addHistoryEntry,
    undo: historyManagerStore().undo,
    redo: historyManagerStore().redo,
    clearHistory: historyManagerStore().clearHistory,
    limitHistoryEntries: historyManagerStore().limitHistoryEntries,
    formatTimestamp: historyManagerStore().formatTimestamp,
    filterHistory: historyManagerStore().filterHistory,
    exportHistory: historyManagerStore().exportHistory,
    importHistory: historyManagerStore().importHistory,
    navigateHistory: historyManagerStore().navigateHistory,
    persistHistory: historyManagerStore().persistHistory,
    customizeHistoryDisplay: historyManagerStore().customizeHistoryDisplay,
    collapseHistorySections: historyManagerStore().collapseHistorySections,
    searchHistory: historyManagerStore().searchHistory,
    integrateWithUserProfiles: historyManagerStore().integrateWithUserProfiles,
    addToClipboardHistory: historyManagerStore().addToClipboardHistory,
    addTaskHistoryEntry: historyManagerStore().addTaskHistoryEntry,
    getTaskHistory: historyManagerStore().getTaskHistory,
  });

  return historyStore;
};

export { historyManagerStore };
export type { HistoryEntry, HistoryStore };
