// DataAnalysisEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface DataAnalysisEndpoints extends EndpointCategoryConfig {
  analyzeData: EndpointConfig;
  getAnalysisResults: EndpointConfig;
  exportAnalysisResults: EndpointConfig;
  startAnalysis: EndpointConfig;
  exportResults: EndpointConfig;
}