// ParameterCustomizationEndpoints.ts
import { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ParameterCustomizationEndpoints extends EndpointCategoryConfig {
  getParameterForm: EndpointConfig;
  fetchParameterCustomization: EndpointConfig;
}