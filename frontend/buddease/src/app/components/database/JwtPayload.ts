// JwtPayload.ts
import * as jwt from 'jsonwebtoken';
import { Scope } from '../state/stores/Scopes';


interface JwtPayload extends jwt.JwtPayload {
    exp?: number; // `exp` is an optional number in seconds

  scopes?: string[]; // Define scopes in the token payload
}

const verifyTokenScopes = (decodedToken: JwtPayload, requiredScopes: Scope[]): boolean => {
  if (!decodedToken.scopes) {
    return false; // No scopes in token
  }
  
  // Check if token contains all required scopes
  return requiredScopes.every(scope => decodedToken.scopes?.includes(scope));
};


export {verifyTokenScopes}