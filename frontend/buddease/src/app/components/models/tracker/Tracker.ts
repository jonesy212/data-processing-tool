//Tracker.ts
import path from "path";
import { useAuth } from "../../auth/AuthContext";
import { DocumentData } from "../../documents/DocumentBuilder";
import { Phase } from "../../phases/Phase";
import { User } from "../../users/User";
import {
  fetchUsersSuccess,
  updateBio,
  updateFullName,
  updateProfilePicture,
  updateQuota,
} from "../../users/UserSlice";
export interface Tracker {
  id: string;
  name: string;
  phases: Phase[];
  getUserProfile?: (userData: User) => void; // New method to get user profile
  trackFileChanges: (file: DocumentData) => void;
  trackFolderChanges: (fileLoader: DocumentData) => void;
  getName?: (trackerName: string) => string;
  updateUserProfile?: (userData: User) => void; // New method to update user profile
  sendNotification?: (notification: string, userData: User) => void; // New method to send notification

  // Add more properties as needed
}

const userData = {} as User;
class TrackerClass implements Tracker {
  id: string;
  name: string;
  phases: Phase[];

  constructor(id: string, name: string, phases: Phase[]) {
    this.id = id;
    this.name = name;
    this.phases = phases;
  }

  // Method to track changes for a file
  trackFileChanges(file: DocumentData): void {
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

  detectContentChanges(file: DocumentData): string {
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
  async trackFolderChanges(fileLoader: DocumentData): Promise<void> {
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
  detectMetadataChanges(file: DocumentData): string {
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
  trackAccessHistory(file: DocumentData): string {
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

    // Dispatch action to update user profile
    dispatch({ type: "LOGIN_WITH_ROLES", payload: { user: userData } });
    console.log("Updating user profile:", userData);
    //  Dispatch update actions using userManagerSlice.actions
    // For example:
    // dispatch(updateFullName(userData.fullName));
    // dispatch(updateBio(userData.bio));
    // dispatch(updateProfilePicture(userData.profilePicture));
  }

  sendNotification(notification: string, userData: User): void {
    // Access dispatch function from AuthContext
    const { dispatch } = useAuth();

    // Dispatch sendNotification action using userManagerSlice.actions
    dispatch({ type: "LOGIN_WITH_ROLES", payload: { user: userData } });

    console.log("Sending notification:", notification);
  }
}

export default TrackerClass;
