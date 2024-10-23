const hasTokenExpired = (exp?: number): boolean => {
  if (exp === undefined) {
    return false; // If no `exp` claim, assume token is not expired
  }
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  return exp < currentTimeInSeconds;
};


export {hasTokenExpired}