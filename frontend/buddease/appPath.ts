import * as path from "path";

const getAppPath = (versionNumber: string, appVersion: string) => {
  const appPath = path.resolve(__filename, "../..");

  // Normalize app path (convert to lowercase, remove underscores and spaces)
  const normalizedAppPath = appPath.toLowerCase().replace(/[_ ]/g, "");

  // Include version information in the app path
  const versionedAppPath = path.join(normalizedAppPath, `${versionNumber}_${appVersion}`);

  return versionedAppPath;
};

export default getAppPath;
