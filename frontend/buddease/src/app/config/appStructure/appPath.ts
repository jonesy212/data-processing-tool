// appPath.ts
import * as path from "path";

import { AppVersion } from "@/app/versions/AppVersion"; // adjust import path
import {   AppEntity, 
  AppK,
  AppMeta,
  AppAttachment,
  AppExcludedFields,
  AppIncludedFields
} from '@/app/typings/entities/AppEntity'
  
type AppVersionOrString = string | AppVersion<AppEntity, 
  AppK,
  AppMeta,
  AppAttachment,
  AppExcludedFields,
  AppIncludedFields
>;

const getAppPath = (versionNumber: string, appVersion: AppVersionOrString) => {
  const appPath = path.resolve(__filename, "../..");

  const normalizedAppPath = appPath.toLowerCase().replace(/[_ ]/g, "");

  let versionString: string;

  if (typeof appVersion === "string") {
    versionString = appVersion;
  } else if (appVersion && typeof appVersion.appVersion === "string") {
    versionString = appVersion.appVersion;
  } else {
    throw new Error("Invalid appVersion: must be string or AppVersion with appVersion property");
  }

  const versionedAppPath = path.join(normalizedAppPath, `${versionNumber}_${versionString}`);

  return versionedAppPath;
};

export default getAppPath;
