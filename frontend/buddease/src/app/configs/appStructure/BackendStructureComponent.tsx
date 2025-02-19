 import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import getAppPath from "../../../../appPath";
import BackendStructure from "./BackendStructure";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { versionNumber, appVersion } = getCurrentAppInfo();
    const appPath = getAppPath(versionNumber, appVersion);
    const frontendPath = path.join(appPath, "dataanalysis/frontend");
    const backendPath = appPath; 

    // Check if the frontend and backend paths are correctly structured
    const frontendExists = await checkDirectoryExists(frontendPath);
    const backendExists = await checkDirectoryExists(backendPath);

    if (!frontendExists || !backendExists) {
      const errors = [];
      
      if (!frontendExists) {
        errors.push(`Frontend path '${frontendPath}' does not exist. Make sure the 'frontend' folder is present.`);
      }
      
      if (!backendExists) {
        errors.push(`Backend path '${backendPath}' does not exist. Make sure the 'data_analysis' folder is present.`);
      }
      
      return res.status(500).json({
        errors,
        message: "Invalid app structure. Please check the frontend and backend paths.",
      });
    }

    // Instantiate and get the frontend structure
    const frontendStructure = new BackendStructure(frontendPath).getStructure();

    // Add logic to handle backend structure (e.g., create a separate BackendStructure class)
    // ...

    res.status(200).json({ frontendStructure });
  } catch (error) {
    console.error("Error occurred while processing request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

async function checkDirectoryExists(directoryPath: string): Promise<boolean> {
  try {
    // Attempt to access the directory path
    await fetch(directoryPath, { method: 'HEAD' });
    // If successful, return true indicating directory exists
    return true;
  } catch (error) {
    // If an error occurs (directory doesn't exist or other error), return false
    return false;
  }
}

