// SharedHeaders.ts
import { createHeaders } from '@/core/api/ApiClient';
import HeadersConfig from '@/core/api/headers/HeadersConfig';

// Use the createHeaders function to get the headers configuration
export const headersConfig: typeof HeadersConfig = createHeaders();
