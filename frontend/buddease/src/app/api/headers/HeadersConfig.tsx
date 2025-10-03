import axiosInstance from '@/app/api/csrfToken';

// HeadersConfig.tsx
export interface HeadersConfig {
    [key: string]: string;
}

const headersConfig: HeadersConfig = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}` || '', // Use localStorage for token
    'X-CSRF-Token': axiosInstance,
    // Add other headers as needed
};

export default headersConfig;
