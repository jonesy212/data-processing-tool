// appPath.ts
import * as path from "path";

import type { AppAttachment, AppEntity, AppMeta } from '@/core/typings/entities/AppEntity';
import { AppExcludedFields, AppIncludedFields, AppK } from '@/core/typings/entities/AppEntity';
    AppAttachment,
    AppEntity,
    AppExcludedFields,
    AppIncludedFields,
    AppK,
    AppMeta
} from '@/core/typings/entities/AppEntity';
import { AppVersion } from "@/core/versions/AppVersion"; // adjust import path
  
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
