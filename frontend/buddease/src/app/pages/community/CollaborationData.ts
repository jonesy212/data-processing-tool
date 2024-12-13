import Milestone from '@/app/components/calendar/CalendarSlice';
import { Communication } from '@/app/components/communications/chat/Communication';
import { Meeting } from '@/app/components/communications/scheduler/Meeting';
import { CollaborationOptions } from '@/app/components/interfaces/options/CollaborationOptions';
import { BaseData, Data } from '@/app/components/models/data/Data';
import { Task } from '@/app/components/models/tasks/Task';
import { Member } from '@/app/components/models/teams/TeamMembers';
import { AllStatus } from '@/app/components/state/stores/DetailsListStore';
import { User } from '@/app/components/users/User';
import { BaseMetadata, BaseMetaDataOptions, UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { Project } from 'next/dist/build/swc';
import { Resource } from 'node_modules/@refinedev/core/dist/hooks/router/use-go';

// CollaborationData.ts
// Define CollaborationData interface by extending BaseData and adding specific properties
interface CollaborationData extends BaseData {
    sharedProjects?: Project[]; // Specific to collaboration
    sharedMeetings?: Meeting[]; // Specific to collaboration
    tasks?: Task[]; // Specific to collaboration
    communications?: Communication[]; // Specific to collaboration
    sharedResources?: Resource[]; // Specific to collaboration
    milestones?: Milestone[]; // Specific to collaboration
    members?: Member[] | string[] | number[]; // Can be Member objects, or IDs as string/number
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
      Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
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
  
  export type { CollaborationData }