// HashUtils.ts
import HashGenerator from "./HashGenerator";

/**
 * Hashes a string using the specified algorithm.
 * @param input - The input string to hash.
 * @param algorithm - The hashing algorithm to use (default: 'sha256').
 * @returns The resulting hash as a hexadecimal string.
 */
export const hashString = (input: string, algorithm: string = 'sha256'): string => {
    return HashGenerator.generateHash(input, algorithm);
  };
