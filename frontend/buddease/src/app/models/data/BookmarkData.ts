// BookmarkData.ts

import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { PhaseDefault } from '@/app/typings/phaseTypes';
import { ProjectPhaseTypeEnum } from "./StatusType";
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
    tags?: string[] | TagsRecord<T> | undefined; 
    phase?: PhaseDefault | null;
    phaseType?: ProjectPhaseTypeEnum;
    status?: AllStatus;
    // Add other properties as needed for bookmark data
  }
  
  export default BookmarkData;
  