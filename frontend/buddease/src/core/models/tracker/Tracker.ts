// FileTracker.ts
import type { HighlightColor } from "@/core/components/styling/Palette";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { detectMetadataChanges } from "@/core/config/metadata/detectMetadataChanges";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { NotificationData } from '@/core/hooks/useNotificationSystem';
import type { FileData } from "@/core/models/data/FileData";
import type { FolderData } from "@/core/models/data/FolderData";
import type { Phase } from '@/core/models/phases/Phase';
import { useAuth } from "@/core/state/context/AuthContext";
import type { Stroke } from "@/core/state/redux/slices/DrawingSlice";
import {
    fetchUsersSuccess,
    updateBio,
    updateFullName,
    updateProfilePicture,
    updateQuota,
} from "@/core/state/redux/slices/UserSlice";
import type { Payment } from "@/core/subscriptions/SubscriptionPlan";
import type { User } from "@/core/users/User";
import path from "path";
import { TrackingIntegration } from '@/scripts/integration/TrackingIntegration';

export interface SharedFormattingOptions {
  borderColor?: string;
  textColor?: string;
  highlightColor?: string;
  backgroundColor?: string;
  fontSize?: string | number;
  fontFamily?: string;
}

// Define a common interface for tracker properties
interface CommonTrackerProps<  
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id?: string;  // Optional
  name?: string;  // Optional
  phases?: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];  // Optional
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
  trackFileChanges?: (file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;  // Optional
  trackFolderChanges?: (folder: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;  // Optional
  updateUserProfile?: (userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, dispatch: any) => void;  // Optional
  sendNotification?: (notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;  // Optional
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
}

interface TrackerProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CommonTrackerProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Additional properties specific to TrackerProps, if any
}

class FileTracker<
  T extends BaseDataEntity = BaseDataEntity,
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
  private userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  private integration: TrackingIntegration;
  private migrationMode: 'legacy' | 'hybrid' | 'integration' = 'hybrid';

  constructor(
    id: string,
    name: string,
    phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    stroke: Stroke,
    strokeWidth: number,
    fillColor: string,
    isFlippedX: boolean,
    isFlippedY: boolean,
    x: number,
    y: number,
    formattingOptions?: SharedFormattingOptions,
    userData?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
    
    if (formattingOptions) {
      Object.assign(this, formattingOptions);
    }
    
    this.userData = userData || {} as User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
    // FIX: Pass proper user data to integration
    this.integration = new TrackingIntegration({
      userId: id,
      userName: name,
      userData: this.userData
    });
    
    console.log('🔄 Tracker initialized with integration system');
  }

  // FIXED: Single updateUserProfile method with delegation
  updateUserProfile(userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, dispatch: any): void {
    // Show deprecation warning
    this.showDeprecationWarning('updateUserProfile');
    
    // Delegate to integration first
    this.integration.updateUserProfile(userData, dispatch);
    
    // Keep legacy logic for backward compatibility
    const fullNameToDispatch = userData.fullName && userData.fullName.trim() !== ""
      ? userData.fullName
      : null;

    if (fullNameToDispatch !== null && dispatch) {
      dispatch(updateFullName(fullNameToDispatch));
      dispatch(updateBio(userData.bio));
      dispatch(updateProfilePicture(userData.profilePicture));
    }
  }

  // FIXED: Single trackFolderChanges method
  async trackFolderChanges(folder: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    this.showDeprecationWarning('trackFolderChanges');
    
    // Delegate to integration
    await this.integration.trackFileChanges({
      ...this.transformFolderForIntegration(folder),
      type: 'folder'
    });
    
    // Keep legacy implementation in hybrid mode
    if (this.migrationMode !== 'integration') {
      try {
        const folderPathUrl = new URL(folder.folderPath, 'file://');
        const response = await fetch(folderPathUrl.toString());
        
        if (!response.ok) {
          throw new Error(`Failed to fetch folder contents: ${response.status}`);
        }

        const folderContents = await response.json();

        for (const file of folderContents) {
          const filePath = path.join(folder.folderPath, file);
          const fileResponse = await fetch(filePath, { method: "HEAD" });

          if (fileResponse.ok) {
            const isDirectory = fileResponse.headers
              .get("content-type")
              ?.startsWith("text/html");

            if (!isDirectory) {
              console.log(`[Legacy] Tracking changes for file: ${filePath}`);
            }
          }
        }
      } catch (error) {
        console.error("Error occurred while tracking folder changes:", error);
      }
    }
  }

  // Helper method to transform folder for integration
  private transformFolderForIntegration(folder: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): any {
    return {
      id: folder.id || `folder-${Date.now()}`,
      name: folder.name || folder.folderPath,
      path: folder.folderPath,
      type: 'folder',
      itemCount: folder.itemCount || 0,
      timestamp: new Date().toISOString()
    };
  }

  // FIXED: Single trackFileChanges method
  trackFileChanges(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    this.showDeprecationWarning('trackFileChanges');
    
    // Calculate legacy metrics before delegation
    const contentChanges = this.detectContentChanges(file);
    const accessHistory = this.trackAccessHistory(file);
    
    // Delegate to integration with all data
    this.integration.trackFileChanges({
      ...this.transformFileForIntegration(file),
      legacyContentChanges: contentChanges,
      legacyAccessHistory: accessHistory,
      migrationSource: 'tracker-wrapper'
    });
    
    // Legacy logging (optional)
    if (this.migrationMode !== 'integration' && process.env.NODE_ENV === 'development') {
      console.log(`[Legacy] File: ${file.title}, Changes: ${contentChanges}`);
    }
  }

  // Helper method to transform file for integration
  private transformFileForIntegration(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): any {
    return {
      id: file.id,
      title: file.title,
      path: file.path || '',
      type: 'file',
      contentHash: this.calculateContentHash(file),
      metadata: file.metadata || {},
      previousContentLength: file.previousContent?.length || 0,
      currentContentLength: file.currentContent?.length || 0,
      timestamp: new Date().toISOString()
    };
  }

  // Send notification method (FIXED)
  sendNotification(
    notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    // Delegate to integration if it has notification support
    if (this.integration['sendNotification']) {
      this.integration['sendNotification'](notification, userData);
    }
    
    // Legacy implementation
    try {
      const { dispatch } = useAuth();
      if (dispatch) {
        dispatch({
          type: "LOGIN_WITH_ROLES",
          payload: { user: userData, authToken: "YOUR_AUTH_TOKEN" },
        });
      }
    } catch (error) {
      console.warn('Could not send notification via AuthContext:', error);
    }
    
    console.log("Sending notification:", notification);
  }

  // Handle user actions (FIXED)
  handleUserActions(userSlice: any): void {
    // Delegate to integration
    if (this.integration['handleUserActions']) {
      this.integration['handleUserActions'](userSlice);
      return;
    }
    
    // Legacy implementation
    const { id, newData } = userSlice;
    
    if (newData?.fullName) {
      updateFullName(newData.fullName);
    }
    if (newData?.bio) {
      updateBio(newData.bio);
    }
    if (newData?.profilePicture) {
      updateProfilePicture(newData.profilePicture);
    }
    if (newData?.notification) {
      this.sendNotification(newData.notification, this.userData);
    }
    if (newData?.uploadQuota) {
      updateQuota(newData.uploadQuota);
    }
    if (newData?.users) {
      fetchUsersSuccess({ users: newData.users });
    }
  }

  detectContentChanges(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
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
  trackAccessHistory(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
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
      this.sendNotification(newData.notification, this.userData); // Dispatch action to send notification
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

  sendNotification(
    notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
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

    private calculateContentHash(file: any): string {
    const content = JSON.stringify(file.currentContent || '');
    return Buffer.from(content).toString('base64').slice(0, 32);
  }

  private determineMigrationMode(): 'legacy' | 'hybrid' | 'integration' {
    // Check environment or configuration
    return process.env.TRACKING_MIGRATION_MODE as any || 'hybrid';
  }
}

export default FileTracker;
export type { CommonTrackerProps, TrackerProps };
