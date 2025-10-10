// apiWebBaseConfig.ts
import { ApiWebBaseEndpoints } from '../types/categories/ApiWebBaseEndpoints';

export const apiWebBaseConfig: ApiWebBaseEndpoints = {
  login: { path: "/login", method: "POST" },
  logout: { path: "/logout", method: "POST" },
};