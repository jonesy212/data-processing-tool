// getUserConfigs.ts
import { UserConfigs } from "@/app/api/userConfigs";
import { userPreferences } from "@/app/config/UserPreferences";
import userSettings from "@/app/config/UserSettings";

/**
 * Universal config loader for frontend and backend.
 * - In Node: reads from fs or env vars
 * - In Browser: fetches or uses static import
 */
export const getUserConfigs = async (): Promise<typeof UserConfigs> => {
  try {
    // --- 1️⃣ Node.js / Backend Path
    if (typeof window === "undefined") {
      const fs = await import("fs");
      const path = require("path");

      const configPath = path.resolve(process.cwd(), "config/userConfig.json");
      if (fs.existsSync(configPath)) {
        const fileData = fs.readFileSync(configPath, "utf-8");
        return JSON.parse(fileData);
      }

      // fallback to env or static
      return {
        ...UserConfigs,
        apiUrl: process.env.USER_API_URL || "https://user.api.com",
        userPreferences,
        userSettings,
      };
    }

    // --- 2️⃣ Browser / Frontend Path
    const storedConfig = localStorage.getItem("userConfig");
    if (storedConfig) {
      return JSON.parse(storedConfig);
    }

    // optional: load from API if session token exists
    const token = localStorage.getItem("authToken");
    if (token) {
      const response = await fetch("/api/user/config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) return await response.json();
    }

    // fallback
    return UserConfigs;
  } catch (error) {
    console.error("Error loading user configs:", error);
    return UserConfigs;
  }
};
