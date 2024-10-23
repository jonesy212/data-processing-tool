// dataAnalysis/DataAnalysisActions.ts
import { createAction } from "@reduxjs/toolkit";
import { DataAnalysis } from "./DataAnalysis";

export const DataAnalysisActions = {
  // Standard actions
  analyzeText: createAction<string>("analysisText"),
  addAnalysisLog: createAction<{
    type: string;
    message: string;
    timestamp: number;
  }>("addAnalysisLog"),
  fetchDataAnalysisRequest: createAction("fetchDataAnalysisRequest"),
  fetchDataAnalysisSuccess: createAction<{ dataAnalysis: DataAnalysis[] }>("fetchDataAnalysisSuccess"),
  fetchDataAnalysisFailure: createAction<{ error: string }>("fetchDataAnalysisFailure"),

  uploadDataAnalysisRequest: createAction("uploadDataAnalysisRequest"),
  uploadDataAnalysisSuccess: createAction<{ dataAnalysis: DataAnalysis }>("uploadDataAnalysisSuccess"),
  uploadDataAnalysisFailure: createAction<{ error: string }>("uploadDataAnalysisFailure"),

  updateDataAnalysisRequest: createAction<{ id: number, newData: DataAnalysis }>("updateDataAnalysisRequest"),
  updateDataAnalysisSuccess: createAction<{ dataAnalysis: DataAnalysis }>("updateDataAnalysisSuccess"),
  updateDataAnalysisFailure: createAction<{ error: string }>("updateDataAnalysisFailure"),

  removeDataAnalysisRequest: createAction<number>("removeDataAnalysisRequest"),
  removeDataAnalysisSuccess: createAction<number>("removeDataAnalysisSuccess"),
  removeDataAnalysisFailure: createAction<{ error: string }>("removeDataAnalysisFailure"),

  // Add more actions as needed
};
