// BookmarkData.ts

import { Phase } from "../../phases/Phase";
import { AllStatus } from "../../state/stores/DetailsListStore";
import { ProjectPhaseTypeEnum } from "./StatusType";

// Define the interface for BookmarkData
interface BookmarkData {
    _id?: string;
    id: string;
    title?: string;
    description?: string | null | undefined;
    startDate?: Date;
    endDate?: Date;
    createdAt?: Date;
    isActive?: boolean;
     tags?: TagsRecord<T, K> | string[] | undefined; 
    phase?: Phase | null;
    phaseType?: ProjectPhaseTypeEnum;
    status?: AllStatus;
    // Add other properties as needed for bookmark data
  }
  
  export default BookmarkData;
  