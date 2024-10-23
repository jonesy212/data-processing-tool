//Tracker.ts
import path from "path";
import { useAuth } from "../../auth/AuthContext";
import { Phase } from "../../phases/Phase";
import { User, UserData } from "../../users/User";
import {
  fetchUsersSuccess,
  updateBio,
  updateFullName,
  updateProfilePicture,
  updateQuota,
} from "../../users/UserSlice";
import FileData from "../data/FileData";
import { Stroke } from "../../state/redux/slices/DrawingSlice";
import { Payment } from "../../subscriptions/SubscriptionPlan";
import FolderData from "../data/FolderData";
import { NotificationData } from "../../support/NofiticationsSlice";
import { useDispatch } from "react-redux";


// Define a common interface for tracker properties
interface CommonTrackerProps {
  id?: string;  // Optional
  name?: string;  // Optional
  phases?: Phase[];  // Optional
  trackFileChanges?: (file: FileData) => void;  // Optional
  trackFolderChanges?: (folder: FolderData) => void;  // Optional
  updateUserProfile?: (userData: User) => void;  // Optional
  sendNotification?: (notification: NotificationData, userData: User) => void;  // Optional
  stroke?: Stroke;
  strokeWidth?: number;
  fillColor?: string;
  flippedX?: boolean;
  flippedY?: boolean;
  x?: number;
  y?: number;
  updateAppearance?: (
    updates: {
      stroke: {
        width: number;
        color: string;
      },
    },

    newStroke: { width: number; color: string },
    newFillColor: string
  ) => void;
}

interface TrackerProps extends CommonTrackerProps {
  // Additional properties specific to TrackerProps, if any
}

const userData = {} as User;
class TrackerClass implements TrackerProps {
  id: string;
  name: string;
  phases: Phase[];
  stroke: Stroke;
  strokeWidth: number;
  fillColor: string;
  flippedX: boolean;
  flippedY: boolean;
  x: number;
  y: number;
  payments?: Payment[];
  constructor(id: string, name: string, phases: Phase[],
    stroke: Stroke,
    strokeWidth: number,
    fillColor: string,
    flippedX: boolean,
    flippedY: boolean,
    x: number,
    y: number,
  ) {
    this.id = id;
    this.name = name;
    this.phases = phases;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.fillColor = fillColor;
    this.flippedX = flippedX;
    this.flippedY = flippedY;
    this.x = x;
    this.y = y;
  }

  // Method to track changes for a file
  trackFileChanges(file: FileData): void {
    // Simulate tracking content changes
    const contentChanges = this.detectContentChanges(file);

    // Simulate tracking metadata modifications
    const metadataChanges = this.detectMetadataChanges(file);

    // Simulate tracking access history
    const accessHistory = this.trackAccessHistory(file);

    // Log the tracked changes
    console.log(`Tracking changes for file: ${file.title}`);
    console.log("Content changes:", contentChanges);
    console.log("Metadata changes:", metadataChanges);
    console.log("Access history:", accessHistory);

  }

  detectContentChanges(file: FileData): string {
    // Dummy implementation: Check if the content length has changed
    const previousContentLength = file.previousContent?.length;
    const currentContentLength = file.currentContent?.length;

    if (previousContentLength !== currentContentLength) {
      return "Detected content changes";
    } else {
      return "No content changes detected";
    }
  }

  // Function to track changes for a folder
  async trackFolderChanges(fileLoader: FolderData): Promise<void> {
    try {
      // Make a fetch request to the folder URL to get its contents
      const folderPathUrl = new URL(fileLoader.folderPath, 'file://');
      const response = await fetch(folderPathUrl.toString());
      
      // Check if the response is successful (status code 200)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch folder contents: ${response.status} ${response.statusText}`
        );
      }

      // Parse the response body as JSON to get the folder contents
      const folderContents = await response.json();

      // Iterate through the folder contents
      for (const file of folderContents) {
        const filePath = path.join(fileLoader.folderPath, file);

        // Make a fetch request to the file URL to check if it's a directory
        const fileResponse = await fetch(filePath, { method: "HEAD" });

        // Check if the response is successful (status code 200)
        if (!fileResponse.ok) {
          throw new Error(
            `Failed to fetch file info: ${fileResponse.status} ${fileResponse.statusText}`
          );
        }

        // Check if the file is a directory
        const isDirectory = fileResponse.headers
          .get("content-type")
          ?.startsWith("text/html");

        if (!isDirectory) {
          // Implement logic to track changes for each file
          console.log(`Tracking changes for file: ${filePath}`);
        }
      }
    } catch (error) {
      console.error("Error occurred while tracking folder changes:", error);
      // Handle errors appropriately, e.g., log or notify
    }
  }

  // Function to retrieve folder contents
  async getFolderContents(folderPath: string): Promise<string[]> {
    try {
      // Make a fetch request to the folder URL to get its contents
      const response = await fetch(folderPath);
  
      // Check if the response is successful (status code 200)
      if (!response.ok) {
        throw new Error(`Failed to fetch folder contents: ${response.status} ${response.statusText}`);
      }
  
      // Parse the response body as JSON to get the folder contents
      const folderContents = await response.json();
  
      // Return the list of files in the folder
      return folderContents.map((file: string) => new URL(file, folderPath).toString());
    } catch (error) {
      console.error("Error occurred while retrieving folder contents:", error);
      return [];
    }
  }

  // Function to detect metadata changes in a document
  detectMetadataChanges(file: FileData): string {
    let changesDetected = false;
    let metadataChanges = "";

    // Check if previous metadata is available
    if (file.previousMetadata) {
      // Compare current metadata with previous metadata
      if (file.metadata?.title !== file.previousMetadata.title) {
        changesDetected = true;
        metadataChanges += "Title has changed. ";
      }
      if (file.metadata?.author !== file.previousMetadata.author) {
        changesDetected = true;
        metadataChanges += "Author has changed. ";
      }
      // Add more comparisons for other metadata properties as needed
    } else {
      // Handle case where previous metadata is not available
      metadataChanges = "No previous metadata available for comparison.";
    }

    // Return the result
    if (changesDetected) {
      return "Detected metadata changes: " + metadataChanges.trim();
    } else {
      return "No metadata changes detected.";
    }
  }

  // Function to track access history of the document
  trackAccessHistory(file: FileData): string {
    // Implement logic to track access history (actual implementation)
    const currentTime = new Date().toISOString();
    const accessRecord = `Accessed at: ${currentTime}`;

    // Append access record to access history
    file.accessHistory = file.accessHistory ?? [];
    file.accessHistory.push(accessRecord);

    return `Access history recorded: ${accessRecord}`;
  }

  getUserProfile(userData: User): void {
    // Implement user profile logic here
    console.log("Getting user profile:", userData);
  }

  // Function to get the name of the tracker
  getName(trackerName: string): string {
    // Perform logic to retrieve the name of the tracker
    // For demonstration purposes, let's assume we have a mapping of tracker IDs to names
    const trackerNamesMap: Record<string, string> = {
      tracker1: "Tracker One",
      tracker2: "Tracker Two",
      tracker3: "Tracker Three",
      // Add more mappings as needed
    };

    // Check if the tracker name exists in the map
    if (trackerName in trackerNamesMap) {
      // Return the corresponding name from the map
      return trackerNamesMap[trackerName];
    } else {
      // Return a default name or handle the case when the name is not found
      return "Unknown Tracker";
    }
  }

  // Method to handle user related actions
  handleUserActions(userSlice: any): void {
    // Implement user-related actions here
    // Example: Dispatch user-related actions using UserActions

    const { id, newData } = userSlice; // Assuming userSlice contains data for updating a user

    // Dispatch actions based on the data received
    if (newData.fullName) {
      updateFullName(newData.fullName); // Dispatch action to update full name
    }
    if (newData.bio) {
      updateBio(newData.bio); // Dispatch action to update bio
    }
    if (newData.profilePicture) {
      updateProfilePicture(newData.profilePicture); // Dispatch action to update profile picture
    }
    if (newData.notification) {
      this.sendNotification(newData.notification, userData); // Dispatch action to send notification
    }
    if (newData.uploadQuota) {
      updateQuota(newData.uploadQuota); // Dispatch action to update upload quota
    }
    if (newData.users) {
      fetchUsersSuccess({ users: newData.users }); // Dispatch action to fetch users
    }
    // Add more dispatches based on your specific requirements and actions defined in UserActions
  }

  // Method to handle authentication related actions
  handleAuthActions(authSlice: any): void {
    // Implement authentication related actions here

    console.log("Handling authentication actions:", authSlice);
  }
  
  updateUserProfile(userData: User): void {
    // Access dispatch function from AuthContext
    const { dispatch } = useAuth();

    // Access Redux dispatch for userManagerSlice actions
    const reduxDispatch = useDispatch();

    // Dispatch action to update user profile
    dispatch({
      type: "LOGIN_WITH_ROLES",
      payload: { user: userData, authToken: "YOUR_AUTH_TOKEN" },
    });
    console.log("Updating user profile:", userData);


     // Preprocess fullName - check for empty string and handle it
    const fullNameToDispatch = userData.fullName && userData.fullName.trim() !== "" 
    ? userData.fullName 
    : null; // Replace empty string with null or any default value

    //  Dispatch update actions using userManagerSlice.actions
    // For example:
    // todo 
    if (userData.fullName !== null) {
      reduxDispatch(updateFullName(fullNameToDispatch));
      reduxDispatch(updateBio(userData.bio));
      reduxDispatch(updateProfilePicture(userData.profilePicture));
    }
  }

  sendNotification(notification: NotificationData, userData: User): void {
    // Access dispatch function from AuthContext
    const { dispatch } = useAuth();

    // Dispatch sendNotification action using userManagerSlice.actions
    dispatch({
      type: "LOGIN_WITH_ROLES",
      payload: { user: userData, authToken: "YOUR_AUTH_TOKEN" },
    });

    console.log("Sending notification:", notification);
  }

  // Implementation of updateAppearance method
  updateAppearance(
    updates: {
      stroke?: {
        width?: number;
        color?: string;
      };
    },
    newStroke: {width: number, color: string},
    newFillColor: string
  ): void {
    // Update the stroke property based on newStroke or updates
    this.stroke.width = updates.stroke?.width ?? newStroke.width; // Use updates if available, otherwise newStroke
    this.stroke.color = updates.stroke?.color ?? newStroke.color; // Use updates if available, otherwise newStroke

    // Update the fill color
    this.fillColor = newFillColor;

    console.log(`Appearance updated to stroke: ${this.stroke.width}px, color: ${this.stroke.color}, fill color: ${newFillColor}`);
  }
}

export default TrackerClass;
export type { CommonTrackerProps, TrackerProps}