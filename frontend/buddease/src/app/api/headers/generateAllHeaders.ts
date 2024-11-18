// generateAllHeaders.ts
import { useSecureSnapshotId } from '@/app/components/utils/useSecureSnapshotId';
import { useSecureStoreId } from '@/app/components/utils/useSecureStoreId';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { authToken } from "@/app/components/auth/authToken";
import createCacheHeaders from "./cacheHeaders";
import generateCustomHeaders from "./customHeaders";
import createRequestHeaders from "./requestHeaders";
import createSecurityHeaders from './securityHeaders'
/**
 * Function to create all necessary headers by combining custom, security, cache, and request headers.
 * @param {Object} options - Options for generating headers.
 * @param {string} authToken - The authentication token for the request.
 * @returns {Record<string, string>} - The combined headers.
 */
function generateAllHeaders(options: { additionalHeaders?: Record<string, string> }, authToken: string): Record<string, string> {
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
