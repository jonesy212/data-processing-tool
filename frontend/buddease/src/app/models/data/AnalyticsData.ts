import {Project} from "@/app/models/projects/Project";
import { SupportedData } from "@/app/models/CommonData";

  // AnalyticsData.ts
  interface AnalyticsData {
    id: string;
    projectId: Project
    data: SupportedData
  }
  
  export default AnalyticsData;
  