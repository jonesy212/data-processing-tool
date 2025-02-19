import {Project} from "../../projects/Project";
import { SupportedData } from "../CommonData";

  // AnalyticsData.ts
  interface AnalyticsData {
    id: string;
    projectId: Project
    data: SupportedData
  }
  
  export default AnalyticsData;
  