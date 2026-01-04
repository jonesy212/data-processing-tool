dataAnalysisConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { DataAnalysisEndpoints } from '@/core/typings/categories/DataAnalysisEndpoints';

export const dataAnalysisConfig: DataAnalysisEndpoints = {
  analyzeData: { path: `${BASE_URL}/api/data-analysis/analyze`, method: "POST" },
  getAnalysisResults: { path: `${BASE_URL}/api/data-analysis/results`, method: "GET" },
  exportAnalysisResults: { path: `${BASE_URL}/api/data-analysis/export`, method: "POST" },
  startAnalysis: { path: `${BASE_URL}/api/data-analysis/start-analysis`, method: "POST" },
  exportResults: { path: `${BASE_URL}/api/data-analysis/export-results`, method: "POST" },
};