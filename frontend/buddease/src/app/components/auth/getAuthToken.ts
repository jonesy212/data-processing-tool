const getAuthToken = (): string => {
  return process.env.YOUR_AUTH_TOKEN || ''; // Accessing YOUR_AUTH_TOKEN directly from process.env
};

export {getAuthToken}