// externalAuthConfig.tts
import { ExternalAuthEndpoints } from '../types/categories/ExternalAuthEndpoints';
import { BASE_URL } from './baseUrl';

export const externalAuthConfig: ExternalAuthEndpoints = {
  wixAuthentication: { path: `${BASE_URL}/external/wix/authenticate`, method: "POST" },
};