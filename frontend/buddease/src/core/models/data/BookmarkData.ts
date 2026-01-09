BookmarkData.ts

import { ProjectPhaseTypeEnum } from "@/core/models/data/StatusType";
import { AllStatus } from "@/core/state/stores/DetailsListStore";
import { PhaseDefault } from '@/core/typings/phaseTypes';
// Define the interface for BookmarkData
interface BookmarkData {
    _id?: string;
    id: string;
    title?: string;
    description?: string | undefined;
    startDate?: Date;
    endDate?: Date;
    createdAt?: Date;
    isActive?: boolean;
    tags?: string[] | TagsRecord<T>; 
    phase?: PhaseDefault | null;
    phaseType?: ProjectPhaseTypeEnum;
    status?: AllStatus;
    // Add other properties as needed for bookmark data
  }
  
  export default BookmarkData;
  