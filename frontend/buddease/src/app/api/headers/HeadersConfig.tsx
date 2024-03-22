import { csrfToken } from "@/app/components/security/csrfToken";

// HeadersConfig.tsx
export interface HeadersConfig {
    [key: string]: string;
}

const headersConfig: HeadersConfig = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}` || '', // Use localStorage for token
    'X-CSRF-Token': csrfToken,
    // Add other headers as needed
};

export default headersConfig;
