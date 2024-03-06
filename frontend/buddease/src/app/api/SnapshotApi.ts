import axios from "axios";
import { useNotification } from "../components/support/NotificationContext";
import { Snapshot } from "../components/state/stores/SnapshotStore";
import { Data } from "../components/models/data/Data";
import { Todo } from "../components/todos/Todo";
import { VideoData } from "../components/video/Video";
import useSnapshotManager from "../components/hooks/useSnapshotManager";
import axiosInstance from "./axiosInstance";
import { endpoints } from "./ApiEndpoints";
import createAuthenticationHeaders from "./headers/authenticationHeaders";
import HeadersConfig from "./headers/HeadersConfig";

const { notify } = useNotification();
const API_BASE_URL = endpoints.snapshots.list;

export const fetchSnapshots = async (): Promise<Snapshot<Data>[]> => {
  try {
    let apiUrl: string;

    // Ensure that API_BASE_URL is resolved to a string value
    if (typeof API_BASE_URL === 'function') {
      apiUrl = API_BASE_URL();
    } else if (typeof API_BASE_URL === 'string') {
      apiUrl = API_BASE_URL;
    } else {
      throw new Error('Invalid API_BASE_URL');
    }

    const response = await axiosInstance.get(apiUrl);
    return response.data.snapshots;
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    throw error;
  }
};

export const addSnapshot = async (newSnapshot: Omit<Snapshot<Data>, "id">) => {
  try {
    let apiUrl: string;

    // Ensure that API_BASE_URL is resolved to a string value
    if (typeof API_BASE_URL === "function") {
      apiUrl = API_BASE_URL();
    } else if (typeof API_BASE_URL === "string") {
      apiUrl = API_BASE_URL;
    } else {
      throw new Error("Invalid API_BASE_URL");
    }

    // Get the authentication token and user ID from local storage or any other source
    const authenticationToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId'); // Assuming you have a user ID stored in local storage

    // Create authentication headers
    const authenticationHeaders = createAuthenticationHeaders(
      authenticationToken,
      userId
    );

    // You can also add other headers here if needed
    const headers: HeadersConfig = {
      ...authenticationHeaders,
      // Add other headers here if needed
      "Content-Type": "application/json",
    };

    // Make the POST request with the defined headers
    const response = await axios.post(apiUrl, newSnapshot, {
      headers: headers,
    });

    if (response.status === 200) {
      // Rest of code
    } else {
      // Rest of code
    }
  } catch (error) {
    console.error("Error adding snapshot:", error);
    throw error;
  }
};

export const removeSnapshot = async (snapshotId: number): Promise<void> => {
  try {
    // Get the authentication token and user ID from local storage or any other source
    const authenticationToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId'); // Assuming you have a user ID stored in local storage

    // Create authentication headers
    const authenticationHeaders = createAuthenticationHeaders(
      authenticationToken,
      userId
    );

    // You can also add other headers here if needed
    const headers: HeadersConfig = {
      ...authenticationHeaders,
      // Add other headers here if needed
      "Content-Type": "application/json",
    };

    // Make the DELETE request with the defined headers
    await axiosInstance.delete(`${API_BASE_URL}/${snapshotId}`, {
      headers: headers,
    });
  } catch (error) {
    console.error("Error removing snapshot:", error);
    throw error;
  }
};

// Additional methods can be added here
