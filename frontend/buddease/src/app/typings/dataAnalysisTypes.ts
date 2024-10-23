// dataAnalysisTypes.ts
export enum DataAnalysisSubPhase {
    DEFINE_OBJECTIVE,
    DATA_COLLECTION,
    CLEAN_DATA,
    DATA_ANALYSIS,
    DATA_VISUALIZATION,
    TRANSFORM_INSIGHTS,
  }
  
  interface DataAnalysisPhaseProps {
    onSubmit: () => void;
  }
  
  export interface DataAnalysisState {
    userSpecificData: any; // Define the type based on your actual data structure
  }
  
  export interface DataAnalysisAction {
    type: string;
    payload?: any;
  }
  
  export type DataAnalysisDispatch = (action: DataAnalysisAction) => void;
  