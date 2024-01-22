// BackendStructureComponent.ts
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import getAppPath from "../../../../appPath";
import BackendStructure from "./BackendStructure";

export default (req: NextApiRequest, res: NextApiResponse) => {
  const appPath = getAppPath();
  const frontendPath = path.join(appPath, "dataanalysis/frontend");
  const backendPath = appPath; 
  
  // Check if the frontend and backend paths are correctly structured
  if (!fs.existsSync(frontendPath) || !fs.existsSync(backendPath)) {
    return res
      .status(500)
      .json({
        error:
          "Invalid app structure. Please check the frontend and backend paths.",
      });
  }

  // Check if the frontend and backend paths are correctly structured
  if (!fs.existsSync(frontendPath) || !fs.existsSync(backendPath)) {
    const errors = [];

    if (!fs.existsSync(frontendPath)) {
      errors.push(
        `Frontend path '${frontendPath}' does not exist. Make sure the 'frontend' folder is present.`
      );
    }

    if (!fs.existsSync(backendPath)) {
      errors.push(
        `Backend path '${backendPath}' does not exist. Make sure the 'data_analysis' folder is present.`
      );
    }

    return res
      .status(500)
      .json({
        errors,
        message:
          "Invalid app structure. Please check the frontend and backend paths.",
      });
  }

  // Instantiate and get the frontend structure
  const frontendStructure = new BackendStructure(frontendPath).getStructure();

  // Add logic to handle backend structure (e.g., create a separate BackendStructure class)
  // ...

  res.status(200).json({ frontendStructure });
  // Add logic to handle backend structure (e.g., create a separate BackendStructure class)
  // ...

  res.status(200).json({ frontendStructure });
};
