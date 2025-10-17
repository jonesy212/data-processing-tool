import { BASE_URL } from '@/app/api/baseUrl';
import { ParameterCustomizationEndpoints } from '@/app/typings/categories/ParameterCustomizationEndpoints';

export const parameterCustomizationConfig: ParameterCustomizationEndpoints = {
  getParameterForm: { path: `${BASE_URL}/api/parameter-customization/form`, method: "GET" },
  fetchParameterCustomization: { path: `${BASE_URL}/api/parameter-customization`, method: "GET" },
};