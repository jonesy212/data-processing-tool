parameterCustomizationConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { ParameterCustomizationEndpoints } from '@/core/typings/categories/ParameterCustomizationEndpoints';

export const parameterCustomizationConfig: ParameterCustomizationEndpoints = {
  getParameterForm: { path: `${BASE_URL}/api/parameter-customization/form`, method: "GET" },
  fetchParameterCustomization: { path: `${BASE_URL}/api/parameter-customization`, method: "GET" },
};