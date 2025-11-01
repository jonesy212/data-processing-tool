// loggingConfig.ts
import { BASE_URL } from '@/app/api/baseUrl';
import { LoggingEndpoints } from '@/app/typings/categories/LoggingEndpoints';

export const loggingConfig: LoggingEndpoints = {
  logs: { path: `${BASE_URL}/logging`, method: "POST" },
  logInfo: { path: `${BASE_URL}/logging/info`, method: "POST" },
  logWarning: { path: `${BASE_URL}/logging/warning`, method: "POST" },
  logError: { path: `${BASE_URL}/logging/error`, method: "POST" },
  logSuccess: { path: `${BASE_URL}/logging/success`, method: "POST" },
  logFailure: { path: `${BASE_URL}/logging/failure`, method: "POST" },
};