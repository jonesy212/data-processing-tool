// AppStructure.ts
import chokidar from "chokidar";
import * as fs from "fs";
import * as path from "path";
import getAppPath from "../../../../appPath";
import { getCurrentAppInfo } from "@/app/generators/VersionGenerator";

interface AppStructureItem {
  path: string;
  content: string;
}



const { versionNumber, appVersion } = getCurrentAppInfo();

export default class AppStructure {
  private structure: Record<string, AppStructureItem> = {};

  constructor(type: "backend" | "frontend") {
    const projectPath =
      type === "backend"
        ? getAppPath(versionNumber, appVersion)
        : path.join(getAppPath(versionNumber, appVersion), "datanalysis/frontend");
    this.traverseDirectory(projectPath, type);

    // Use chokidar to watch for file changes
    const watcher = chokidar.watch(projectPath, {
      ignoreInitial: true, // Ignore the initial file system scan
    });

    // Event listener for file changes
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
        // Logic to parse file and update structure accordingly
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
      // Logic to handle file changes and update the structure accordingly
      console.log(`File changed: ${event} ${filePath}`);

      // Read the updated content
      const updatedContent = await fs.promises.readFile(filePath, "utf-8");

      // Update the structure
      this.structure[path.basename(filePath)] = {
        path: filePath,
        content: updatedContent,
      };

      // Additional logic if needed
    } catch (error) {
      console.error(`Error handling file change: ${error}`);
    }
  }
}

export type { AppStructureItem };
