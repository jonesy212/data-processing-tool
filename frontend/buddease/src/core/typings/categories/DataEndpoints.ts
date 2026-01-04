DataEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface DataEndpoints extends EndpointCategoryConfig {
  single: EndpointConfig;
  list: EndpointConfig;
  getData: EndpointConfig;
  addData: EndpointConfig;
  getSpecificData: EndpointConfig;
  deleteData: EndpointConfig;
  updateDataTitle: EndpointConfig;
  streamData: EndpointConfig;
  dataProcessing: EndpointConfig;
  updateData: EndpointConfig;
  highlightList: EndpointConfig;
  addHighlight: EndpointConfig;
  getSpecificHighlight: EndpointConfig;
  updateHighlight: EndpointConfig;
  deleteHighlight: EndpointConfig;
  uploadData: EndpointConfig;
  hypothesisTest: EndpointConfig;
}