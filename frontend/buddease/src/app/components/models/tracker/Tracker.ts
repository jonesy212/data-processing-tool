//Tracker.ts
import { useAuth } from "../../auth/AuthContext";
import { DocumentData } from "../../documents/DocumentBuilder";
import { Phase } from "../../phases/Phase";
import { User } from "../../users/User";
export interface Tracker {
  id: string;
  name: string;
  phases: Phase[];
  trackFileChanges: (file: DocumentData) => void;
  trackFolderChanges: (fileLoader: DocumentData) => void;
  getName?      : (trackerName: string) => string;
  updateUserProfile?: (userData: User) => void; // New method to update user profile
  sendNotification?: (notification: string, userData: User) => void; // New method to send notification

  // Add more properties as needed
}

class TrackerClass implements Tracker {
  id: string;
  name: string;
  phases: Phase[];

  constructor(id: string, name: string, phases: Phase[]) {
    this.id = id;
    this.name = name;
    this.phases = phases;
  }

  trackFileChanges(file: DocumentData): void {
    // Implement file tracking logic here
    console.log(`Tracking changes for file: ${file.title}`);
  }

  trackFolderChanges(): void {
    // Implement folder tracking logic here
    console.log("Tracking changes for folder.");
  }

  getName(trackerName: string): string {
    // Implementation for getName method
    return trackerName; // For demonstration, you can replace this with your actual implementation
  }

  // Method to handle user related actions
  handleUserActions(userSlice: any): void {
    // Implement user-related actions here
    console.log("Handling user actions:", userSlice);
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
