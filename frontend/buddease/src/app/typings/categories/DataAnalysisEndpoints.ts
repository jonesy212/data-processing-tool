// DataAnalysisEndpoints.ts
import { EndpointConfig } from '@/config/EndpointConfig';

export interface DataAnalysisEndpoints {
  analyzeData: EndpointConfig;
  getAnalysisResults: EndpointConfig;
  exportAnalysisResults: EndpointConfig;
  startAnalysis: EndpointConfig;
  exportResults: EndpointConfig;
}