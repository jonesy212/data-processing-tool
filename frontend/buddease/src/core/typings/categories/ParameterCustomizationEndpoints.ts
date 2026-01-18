// ParameterCustomizationEndpoints.ts
import type { EndpointCategoryConfig, EndpointConfig } from '@/core/config/EndpointConfig';

export interface ParameterCustomizationEndpoints extends EndpointCategoryConfig {
  getParameterForm: EndpointConfig;
  fetchParameterCustomization: EndpointConfig;
}