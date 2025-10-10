import { ParameterCustomizationEndpoints } from '../types/categories/ParameterCustomizationEndpoints';
import { BASE_URL } from './baseUrl';

export const parameterCustomizationConfig: ParameterCustomizationEndpoints = {
  getParameterForm: { path: `${BASE_URL}/api/parameter-customization/form`, method: "GET" },
  fetchParameterCustomization: { path: `${BASE_URL}/api/parameter-customization`, method: "GET" },
};