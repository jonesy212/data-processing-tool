// generateHeaders.tsx

import { HeadersConfig } from "../api/headers/HeadersConfig";

const generateHeaders = (): Headers => {
  const headers: Headers = new Headers();
  const headersConfig: HeadersConfig = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}` || '',
    // Add other headers as needed
  };

  for (const key in headersConfig) {
    headers.append(key, headersConfig[key]);
  }

  return headers;
};

export default generateHeaders;
