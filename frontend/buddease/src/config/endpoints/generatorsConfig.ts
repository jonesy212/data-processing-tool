// generatorsConfig.ts
import { GeneratorsEndpoints } from '../types/categories/GeneratorsEndpoints';
import { BASE_URL } from './baseUrl';

export const generatorsConfig: GeneratorsEndpoints = {
  generateTransferToken: { path: `${BASE_URL}/api/generators/generate-transfer-token`, method: "POST" },
};