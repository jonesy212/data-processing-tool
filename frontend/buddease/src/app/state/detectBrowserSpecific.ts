import { BrowserBehaviorConfig } from "./BrowserBehaviorManager";

const detectBrowserSpecific = (): BrowserBehaviorConfig["browserSpecific"] => {
  const userAgent = navigator.userAgent;
  const isMobile = /Mobile|Android|iP(hone|ad|od)/.test(userAgent);
  let browserType = "Unknown";

  if (userAgent.includes("Chrome")) browserType = "Chrome";
  else if (userAgent.includes("Firefox")) browserType = "Firefox";
  else if (userAgent.includes("Safari")) browserType = "Safari";

  return { isMobile, browserType };
};

export { detectBrowserSpecific }