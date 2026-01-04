traverseFrontendDirectoryExample.ts

Usage example
const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const projectStructure = await traverseFrontendDirectory(projectPath);

console.log(projectStructure);

