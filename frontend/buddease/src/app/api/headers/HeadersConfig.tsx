// HeadersConfig.tsx
import csrfToken from '@/app/api/csrfToken';

export interface HeadersConfig {
    [key: string]: string;
}

// Check what csrfToken actually is and extract the token value
let csrfTokenValue = '';

// If csrfToken is an Axios instance with interceptors, you might need to get the token differently
if (typeof csrfToken === 'string') {
  csrfTokenValue = csrfToken;
} else if (csrfToken && (csrfToken as any).defaults && (csrfToken as any).defaults.headers) {
  // If it's an Axios instance, try to extract from headers
  csrfTokenValue = (csrfToken as any).defaults.headers['X-CSRF-Token'] || '';
}

const headersConfig: HeadersConfig = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}` || '',
    'X-CSRF-Token': csrfTokenValue,
};

export default headersConfig;