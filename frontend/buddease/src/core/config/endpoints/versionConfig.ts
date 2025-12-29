// versionConfig.ts
import { VersionEndpoints } from '@/core/typings/categories/VersionEndpoints';

export const versionConfig: VersionEndpoints = {
  getVersion: { path: "/version", method: "GET" },
  updateVersion: { path: "/version", method: "PUT" },
  deleteVersion: { path: "/version", method: "DELETE" },
  backend: { path: "/version/backend", method: "GET" },
  frontend: {path: "/version/frontend", method: "GET"},
};