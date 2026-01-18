// CollaborationData.ts
import { Communication } from '@/core/components/communications/CommunicationPage';
import { Meeting } from '@/core/components/communications/scheduler/Meeting';
import { Task } from '@/core/components/models/tasks/Task';
import type { BaseMetaDataOptions } from "@/core/config/MetaDataOptions";
import { CollaborationOptions } from '@/core/interfaces/options/CollaborationOptions';
import type { BaseData } from '@/core/models/data/Data';
import { Member } from '@/core/models/members/Member';
import { Project } from '@/core/models/projects/Project';
import Milestone from '@/core/state/redux/slices/CalendarSlice';
import { Resource } from '@/core/state/redux/slices/CollaborationSlice';
import type { AllStatus } from '@/core/state/stores/DetailsListStore';
import { User } from '@/core/users/User';

// Define CollaborationData interface by extending BaseData and adding specific properties
interface CollaborationData extends BaseData {
    sharedProjects?: Project[]; // Specific to collaboration
    sharedMeetings?: Meeting[]; // Specific to collaboration
    tasks?: Task[]; // Specific to collaboration
    communications?: Communication[]; // Specific to collaboration
    sharedResources?: Resource[]; // Specific to collaboration
    milestones?: Milestone[]; // Specific to collaboration
    members?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | string[] | number[]; // Can be Member objects, or IDs as string/number
    leader?: User | null; // Specific to collaboration
    collaborationOptions?: CollaborationOptions[]; // Specific collaboration settings/options
    isShared?: boolean; // Indicates if the data is shared across collaboration
    // Additional properties specific to CollaborationData can be added here
  
    // Use optional fields to retain flexibility and allow reuse in various scenarios
    [key: string]: any; // Allow dynamic properties
  }
  
  // Define CollaborationMeta interface by extending BaseMetaDataOptions and adding specific properties
  interface CollaborationMeta<
      T extends BaseData<any> = CollaborationData,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
    >  extends BaseMetaDataOptions<T, K> {
    projectId?: string; // Specific to collaboration metadata
    projectType?: string; // Project type for collaboration context
    lastEditedBy?: string; // User who last edited the metadata
    status?: AllStatus | null; // Status of the collaboration (active, completed, etc.)
    permissions?: string[]; // User permissions related to collaboration
    isPublic?: boolean; // Indicates if the collaboration is public or private
    // Add additional collaboration-specific metadata fields as needed
  
    // Retain default properties from BaseMetaDataOptions
    createdBy: string;
    timestamp: string | number | Date | undefined;
    description?: string;
    [key: string]: any; // Allow dynamic properties
  }
  
  export type { CollaborationData };
