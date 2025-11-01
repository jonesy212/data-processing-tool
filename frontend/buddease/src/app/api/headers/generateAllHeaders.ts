// generateAllHeaders.ts
import { useSecureSnapshotId } from '@/app/hooks/useSecureSnapshotId';
;
import { useSecureStoreId } from '@/app/hooks/useSecureStoreId';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { authToken } from "@/app/server/auth/authToken";
import createCacheHeaders from "@/app/api/headers/cacheHeaders";
import generateCustomHeaders from "@/app/api/headers/customHeaders";
import createRequestHeaders from "@/app/api/headers/requestHeaders";
import createSecurityHeaders from '@/app/api/headers/securityHeaders'
/**
 * Function to create all necessary headers by combining custom, security, cache, and request headers.
 * @param {Object} options - Options for generating headers.
 * @param {string} authToken - The authentication token for the request.
 * @returns {Record<string, string>} - The combined headers.
 */
function generateAllHeaders(
  options: { additionalHeaders?: Record<string, string> }, 
  authToken: string): Record<string, string> {
  const customHeaders: Record<string, string> = generateCustomHeaders(options) || {};
  const securityHeaders: Record<string, string> = createSecurityHeaders() || {};
  const cacheHeaders: Record<string, string> = createCacheHeaders() || {};
  const requestHeaders: Record<string, string> = createRequestHeaders(authToken) || {};

  // Merge all the headers into one object
  const combinedHeaders: Record<string, string> = {
    ...customHeaders,
    ...securityHeaders,
    ...cacheHeaders,
    ...requestHeaders,
    // If additional options are provided, they can overwrite common values
    ...(options.additionalHeaders || {}),
  };

  return combinedHeaders;
}
export { generateAllHeaders };

// Example usage when calling getSnapshot
export const additionalHeaders: Record<string, string> = generateAllHeaders({ additionalHeaders: { 'Custom-Header': 'value' } }, authToken);
