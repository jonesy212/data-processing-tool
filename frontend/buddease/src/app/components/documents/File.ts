// File.ts
import { K, T } from "../models/data/dataStoreMethods";
import { TagsRecord } from "../snapshots/SnapshotWithCriteria";
import { AllTypes } from "../typings/PropTypes";

// File interface representing a file
interface CustomFile extends File{
  readonly name: string;                // The name of the file
  readonly size: number;                // The size of the file in bytes
  readonly type: string;                // The MIME type of the file
  readonly lastModified: number;        // The timestamp when the file was last modified
  uploader: string;                     // The username or ID of the user who uploaded the file
  uploadDate: Date;                     // The date and time when the file was uploaded
  description?: string;                 // Optional description of the file
  tags?: TagsRecord<T, K<T>> | string[] | undefined;                       // Optional tags associated with the file
  downloadCount: number;                // The number of times the file has been downloaded
  visibility: AllTypes
    accessControl?: {                   // Access control settings for the file
    visibility: AllTypes
    allowedUsers?: string[];            // List of usernames or IDs allowed to access the file
    allowedGroups?: string[];           // List of group names or IDs allowed to access the file
        permissions?: {
                                        // Permissions for different actions on the file
      read: boolean;                    // Whether users can read/view the file
      write: boolean;                   // Whether users can modify/update the file
      delete: boolean;                  // Whether users can delete the file
      share: boolean;                   // Whether users can share the file with others
    };
  };
  // Add any additional properties as needed
}


export default CustomFile;








