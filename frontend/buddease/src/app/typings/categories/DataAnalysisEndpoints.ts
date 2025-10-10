// DataAnalysisEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface DataAnalysisEndpoints {
  analyzeData: EndpointConfig;
  getAnalysisResults: EndpointConfig;
  exportAnalysisResults: EndpointConfig;
  startAnalysis: EndpointConfig;
  exportResults: EndpointConfig;
}