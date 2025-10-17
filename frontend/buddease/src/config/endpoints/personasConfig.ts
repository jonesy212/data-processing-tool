// personasConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { PersonasEndpoints } from '@/app/typings/categories/PersonasEndpoints';

export const personasConfig: PersonasEndpoints = {
  selectedPersona: { path: `${BASE_URL}/api/persona`, method: "GET" },
};