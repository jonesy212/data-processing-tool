// personasConfig.ts
import { PersonasEndpoints } from '../types/categories/PersonasEndpoints';
import { BASE_URL } from './baseUrl';

export const personasConfig: PersonasEndpoints = {
  selectedPersona: { path: `${BASE_URL}/api/persona`, method: "GET" },
};