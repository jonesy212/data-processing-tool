// generatorsConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { GeneratorsEndpoints } from '@/core/typings/categories/GeneratorsEndpoints';

export const generatorsConfig: GeneratorsEndpoints = {
  generateTransferToken: { path: `${BASE_URL}/api/generators/generate-transfer-token`, method: "POST" },
};