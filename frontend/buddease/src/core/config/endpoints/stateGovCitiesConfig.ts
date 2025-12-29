// stateGovCitiesConfig.ts
import { BASE_URL } from '@/core/api/baseUrl';
import { StateGovCitiesEndpoints } from '@/core/typings/categories/StateGovCitiesEndpoints';

export const stateGovCitiesConfig: StateGovCitiesEndpoints = {
  list: { path: `${BASE_URL}/api/state-gov-cities`, method: "GET" },
  single: (cityId: number) => ({ path: `${BASE_URL}/api/state-gov-cities/${cityId}`, method: "GET" }),
  add: { path: `${BASE_URL}/api/state-gov-cities`, method: "POST" },
  remove: (cityId: number) => ({ path: `${BASE_URL}/api/state-gov-cities/${cityId}`, method: "DELETE" }),
  update: (cityId: number) => ({ path: `${BASE_URL}/api/state-gov-cities/${cityId}`, method: "PUT" }),
};