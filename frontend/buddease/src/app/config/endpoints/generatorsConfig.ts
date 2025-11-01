// generatorsConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { GeneratorsEndpoints } from '@/app/typings/categories/GeneratorsEndpoints';

export const generatorsConfig: GeneratorsEndpoints = {
  generateTransferToken: { path: `${BASE_URL}/api/generators/generate-transfer-token`, method: "POST" },
};