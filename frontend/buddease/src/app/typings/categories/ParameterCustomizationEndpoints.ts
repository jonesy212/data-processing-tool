// ParameterCustomizationEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/app/config/EndpointConfig';

export interface ParameterCustomizationEndpoints extends EndpointCategoryConfig {
  getParameterForm: EndpointConfig;
  fetchParameterCustomization: EndpointConfig;
}