// appPath.ts
import path from 'path';

const getAppPath = (versionNumber: string, appVersion: string) => {
  const currentFilePath = __filename;
  const appPath = path.resolve(currentFilePath, '../..'); // Go up three levels to reach the app root

  // Handle variations in app folder names (convert to lowercase)
  const normalizedAppPath = appPath.toLowerCase().replace(/[_ ]/g, ''); 

  // Include version information in the app path
  const versionedAppPath = path.join(normalizedAppPath, `${versionNumber}_${appVersion}`);

  return versionedAppPath;
};

export default getAppPath;
