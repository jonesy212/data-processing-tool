// DataAnalysisEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DataAnalysisEndpoints extends EndpointCategoryConfig {
  analyzeData: EndpointConfig;
  getAnalysisResults: EndpointConfig;
  exportAnalysisResults: EndpointConfig;
  startAnalysis: EndpointConfig;
  exportResults: EndpointConfig;
}