// generateTokens.ts
import * as jwt from 'jsonwebtoken';
import { Scope } from '../components/state/stores/Scopes';
import { User } from '../components/users/User';

interface TokenOptions {
  creationTime?: number;       // Timestamp for when the token was created
  expiresIn?: string | number; // Duration after which the token expires (e.g., '1h' or 3600000 ms)
  defaultExpiresIn?: string | number; // Default expiration duration if `expiresIn` is not set
}
interface GenerateTokenOptions extends TokenOptions {
    expiresIn?: string; // Optionally set token expiration
  }
  
// Update the function to accept `options` parameter
const generateToken = (user: User, scopes: Scope[], options?: GenerateTokenOptions): string => {
const secret = process.env.JWT_SECRET || 'your-default-secret';
const payload = {
    sub: user._id, // User ID
    scopes: scopes, // Scopes assigned to the user
    // Additional claims
};

return jwt.sign(payload, secret, { expiresIn: options?.expiresIn || '1h' });
};

export { generateToken };
