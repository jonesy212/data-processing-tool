// personasConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { PersonasEndpoints } from '@/core/typings/categories/PersonasEndpoints';

export const personasConfig: PersonasEndpoints = {
  selectedPersona: { path: `${BASE_URL}/api/persona`, method: "GET" },
};