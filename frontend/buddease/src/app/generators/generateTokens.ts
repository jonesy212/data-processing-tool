// generateTokens.ts
import * as jwt from 'jsonwebtoken';
import { Scope } from '../components/state/stores/Scopes';
import { User } from '../components/users/User';


interface GenerateTokenOptions {
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

return jwt.sign(payload, secret, { expiresIn: '1h' });
};

export { generateToken };
