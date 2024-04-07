import chokidar from "chokidar";
import * as fs from "fs";
import * as path from "path";
import getAppPath from "../../../../appPath";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";

// Define the interface for AppStructureItem
interface AppStructureItem {
  path: string;
  content: string;
}

const { versionNumber, appVersion } = getCurrentAppInfo();

// Modify AppStructure to accept type "backend" or "frontend"
export default class AppStructure {
  private structure: Record<string, AppStructureItem> = {};

  constructor(type: "backend" | "frontend") {
    const projectPath =
      type === "backend"
        ? getAppPath(versionNumber, appVersion)
        : path.join(getAppPath(versionNumber, appVersion), "datanalysis/frontend");
    this.traverseDirectory(projectPath, type);

    const watcher = chokidar.watch(projectPath, {
      ignoreInitial: true,
    });

    watcher.on("all", (event: any, filePath: string) => {
      this.handleFileChange(event, filePath);
    });
  }

  private traverseDirectory(dir: string, type: "backend" | "frontend") {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      if (isDirectory) {
        this.traverseDirectory(filePath, type);
      } else {
        if (
          (type === "backend" && file.endsWith(".py")) ||
          (type === "frontend" && file.endsWith(".tsx"))
        ) {
          this.structure[file] = {
            path: filePath,
            content: fs.readFileSync(filePath, "utf-8"),
          };
        }
      }
    }
  }

  getStructure(): Record<string, AppStructureItem> {
    return { ...this.structure };
  }

  private async handleFileChange(event: string, filePath: string) {
    try {
      console.log(`File changed: ${event} ${filePath}`);

      const updatedContent = await fs.promises.readFile(filePath, "utf-8");

      this.structure[path.basename(filePath)] = {
        path: filePath,
        content: updatedContent,
      };

    } catch (error) {
      console.error(`Error handling file change: ${error}`);
    }
  }
}

// Remove the export of AppStructureItem since it's already exported as a type
export type { AppStructureItem };
