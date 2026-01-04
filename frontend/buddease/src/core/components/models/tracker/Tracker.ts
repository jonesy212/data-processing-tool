Tracker.ts
Tracker.ts

import { HighlightColor } from "@/core/components/styling/Palette";
import type { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { detectMetadataChanges } from "@/core/config/metadata/detectMetadataChanges";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import FileData from "@/core/models/data/FileData";
import FolderData from "@/core/models/data/FolderData";
import { Phase } from '@/core/models/phases/Phase';
import { TrackerProps } from '@/core/models/tracker/Tracker';
import { useAuth } from "@/core/state/context/AuthContext";
import { Stroke } from "@/core/state/redux/slices/DrawingSlice";
import {
    fetchUsersSuccess,
    updateBio,
    updateFullName,
    updateProfilePicture,
    updateQuota,
} from "@/core/state/redux/slices/UserSlice";
import { Payment } from "@/core/subscriptions/SubscriptionPlan";
import type { UserAttachment, UserEntity, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/core/typings/entities/UserEntity';
import { User } from "@/core/users/User";
import path from "path";

export interface SharedFormattingOptions {
  borderColor?: string;
  textColor?: string;
  highlightColor?: string;
  backgroundColor?: string;
  fontSize?: string | number;
  fontFamily?: string;
}

Define a common interface for tracker properties
interface CommonTrackerProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id?: string;  // Optional
  name?: string;  // Optional
  phases?: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];  // Optional
  trackFileChanges?: (file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;  // Optional
  trackFolderChanges?: (folder: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;  // Optional
  updateUserProfile?: (
    userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, dispatch: any) => void;  // Optional
  sendNotification?: (
    notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;  // Optional
  stroke?: Stroke;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  isFlippedX?: boolean;
  isFlippedY?: boolean;
  position?: number
  x?: number;
  y?: number;
  rotation?: number;


   // Update appearance function with comprehensive properties
   updateAppearance?: (
     newStroke: Stroke,  // New stroke to be applied
     newFillColor: string,  // New fill color to be applied
     updates: {
       stroke?: Stroke;  // Optional stroke updates
       fillColor?: string;  // Optional fill color updates
       borderColor?: string;  // Optional border color updates
       textColor?: string;  // Optional text color updates
       highlightColor?: HighlightColor;  // Optional highlight settings
       backgroundColor?: string;  // Optional background color updates
       fontSize?: string;  // Optional font size updates
       fontFamily?: string;  // Optional font family updates
     },
     newBorderColor?: string,  // Optional new border color
     newHighlightColor?: string, // Optional new highlight color
  ) => void;
  
  // todo verify above works original
  // updateAppearance?: (
  //   updates: {
  //     stroke: {
  //       width: number;
  //       color: string;
  //     },
  //   },

  //   newStroke: { width: number; color: string },
  //   newFillColor: string
  // ) => void;
}

const userData = {} as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>;

class Tracker<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements TrackerProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  name: string;
  phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  stroke: Stroke;
  strokeWidth: number;
  fillColor: string;
  isFlippedX: boolean;
  isFlippedY: boolean;
  x: number;
  y: number;
  payments?: Payment[];

    // Shared formatting options
    borderColor?: string;
    textColor?: string;
    highlightColor?: string;
    backgroundColor?: string;
    fontSize?: string | number;
    fontFamily?: string;
  
  formattingOptions?: SharedFormattingOptions // Optional formatting options

    // Shared formatting properties

  constructor(id: string, name: string, phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    stroke: Stroke,
    strokeWidth: number,
    fillColor: string,
    isFlippedX: boolean,
    isFlippedY: boolean,
    x: number,
    y: number,
        formattingOptions?: SharedFormattingOptions // Optional formatting options

  ) {
    this.id = id;
    this.name = name;
    this.phases = phases;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.fillColor = fillColor;
    this.isFlippedX = isFlippedX;
    this.isFlippedY = isFlippedY;
    this.x = x;
    this.y = y;
    // Initialize formatting options
    if (formattingOptions) {
      Object.assign(this, formattingOptions);
    }
  }

  // Method to track changes for a file
trackFileChanges<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    // Simulate tracking content changes
    const contentChanges = this.detectContentChanges(file);

    // Simulate tracking metadata modifications
    const metadataChanges = detectMetadataChanges(file);

    // Simulate tracking access history
    const accessHistory = this.trackAccessHistory(file);

    // Log the tracked changes
    console.log(`Tracking changes for file: ${file.title}`);
    console.log("Content changes:", contentChanges);
    console.log("Metadata changes:", metadataChanges);
    console.log("Access history:", accessHistory);

  }

  detectContentChanges<
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
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
  async trackFolderChanges(fileLoader: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
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

  // Function to track access history of the document
  trackAccessHistory<
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
    // Implement logic to track access history (actual implementation)
    const currentTime = new Date().toISOString();
    const accessRecord = `Accessed at: ${currentTime}`;

    // Append access record to access history
    file.accessHistory = file.accessHistory ?? [];
    file.accessHistory.push(accessRecord);

    return `Access history recorded: ${accessRecord}`;
  }

  getUserProfile(userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
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
  
  
  updateUserProfile(userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, dispatch: any): void {
    // Preprocess fullName - check for empty string and handle it
    const fullNameToDispatch = userData.fullName && userData.fullName.trim() !== ""
      ? userData.fullName
      : null;

    // Dispatch update actions
    if (fullNameToDispatch !== null) {
      dispatch(updateFullName(fullNameToDispatch));
      dispatch(updateBio(userData.bio));
      dispatch(updateProfilePicture(userData.profilePicture));
    }
  }

  sendNotification(notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
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
    newStroke: Stroke,
    newFillColor: string,
    updates: {
      stroke?: Stroke;
      fillColor?: string;
      borderColor?: string;
      textColor?: string;
      highlightColor?: any;
      backgroundColor?: string;
      fontSize?: string;
      fontFamily?: string;
    }
  ): void {
    // Update the stroke property based on updates or newStroke
    this.stroke.width = updates.stroke?.width ?? newStroke.width;
    this.stroke.color = updates.stroke?.color ?? newStroke.color;

    // Update the fill color
    this.fillColor = updates.fillColor ?? newFillColor;

    // Update other properties if provided in updates
    if (updates.borderColor !== undefined) this.borderColor = updates.borderColor;
    if (updates.textColor !== undefined) this.textColor = updates.textColor;
    if (updates.highlightColor !== undefined) this.highlightColor = updates.highlightColor;
    if (updates.backgroundColor !== undefined) this.backgroundColor = updates.backgroundColor;
    if (updates.fontSize !== undefined) this.fontSize = updates.fontSize;
    if (updates.fontFamily !== undefined) this.fontFamily = updates.fontFamily;
 
    console.log(`Appearance updated to stroke: ${this.stroke.width}px, color: ${this.stroke.color}, fill color: ${this.fillColor}`);
  }
}

export default Tracker;
export type { CommonTrackerProps };
