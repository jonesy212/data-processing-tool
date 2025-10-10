// DataEndpoints.ts
import { EndpointConfig } from '../EndpointConfigurations';

export interface DataEndpoints {
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