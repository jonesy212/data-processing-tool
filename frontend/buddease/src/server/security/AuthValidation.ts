// AuthValidation.ts
// AuthValidation.ts
const isValidAuthToken = (authToken: string | null): boolean => {
  if (!authToken) return false;
  
  // Check if the token format is valid (alphanumeric and hyphens only)
  const isValidFormat = /^[a-zA-Z0-9-]+$/.test(authToken);

  // Check if the token length is valid (36 characters for UUID-like tokens)
  const isValidLength = authToken.length === 36;

  // Check if token matches expected pattern (e.g., UUID format)
  const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authToken);

  // Optional: Check against a list of valid tokens (for server-to-server communication)
  const validTokens = process.env.API_VALID_TOKENS?.split(',') || [];
  const isInValidList = validTokens.includes(authToken);

  // Combine validation conditions
  // Use either pattern validation or token list validation
  const isValid = (isValidFormat && isValidLength) || isInValidList;

  return isValid;
};

export default isValidAuthToken;
