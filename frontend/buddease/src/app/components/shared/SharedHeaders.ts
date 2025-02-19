// SharedHeaders.ts
import { createHeaders } from '@/app/api/ApiClient';
import HeadersConfig from '../../api/headers/HeadersConfig';

// Use the createHeaders function to get the headers configuration
export const headersConfig: typeof HeadersConfig = createHeaders();
