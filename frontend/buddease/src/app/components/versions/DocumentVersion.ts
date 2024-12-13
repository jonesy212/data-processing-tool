import Logger from '@/app/components/logging/Logger';
import * as path from 'path';

let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

class DocumentVersioning {
  private versions: { [key: string]: number } = {};
  private dataPath: string;

  constructor(dataPath: string) {
    this.dataPath = dataPath;
  }

  initializeVersions(): void {
    try {
      if (fs) { // Check if 'fs' is available (server-side)
        const files = fs.readdirSync(this.dataPath);
        for (const file of files) {
          const filePath = path.join(this.dataPath, file);
          const isDirectory = fs.statSync(filePath).isDirectory();

          if (!isDirectory && file.endsWith('.json')) {
            const dataKey = path.basename(file, path.extname(file));
            this.versions[dataKey] = 0; // Initialize with version 0
          }
        }
      } else {
        Logger.error('File system module (fs) is not available. Document versioning initialization skipped.');
      }
    } catch (error) {
      Logger.error(`Error initializing document versions: ${error}`);
      throw error;
    }
  }

  getCurrentVersion(documentName: string): number {
    return this.versions[documentName] || 0;
  }

  incrementVersion(documentName: string): void {
    this.versions[documentName] = (this.versions[documentName] || 0) + 1;
  }

  logVersionChange(documentName: string, newVersion: number): void {
    Logger.log('Version Change', `Version of document '${documentName}' updated to ${newVersion}`);
  }
  generateNewVersion(documentName: string, newData: any): void {
    try {
      if (fs) { // Check if 'fs' is available (server-side)
        const currentVersion = this.getCurrentVersion(documentName);
        const newVersion = currentVersion + 1;
        
        // Update the document with new data (e.g., save to file/database)
        // Example: updateDocument(documentName, newData);
  
        // Increment version and log the change
        this.incrementVersion(documentName);
        this.logVersionChange(documentName, newVersion);
      } else {
        Logger.error('File system module (fs) is not available. Unable to generate new version.');
      }
    } catch (error) {
      Logger.error(`Error generating new version for document '${documentName}': ${error}`);
      throw error;
    }
  }
    
  compareVersions(documentName: string, version1: number, version2: number): void {
    try {
      if (fs) { // Check if 'fs' is available (server-side)
        const filePath = path.join(this.dataPath, `${documentName}_${version1}.json`);
        const filePath2 = path.join(this.dataPath, `${documentName}_${version2}.json`);
  
        const data1 = fs.readFileSync(filePath, 'utf-8');
        const data2 = fs.readFileSync(filePath2, 'utf-8');
  
        // Compare the contents of the documents
        if (data1 === data2) {
          Logger.log('Version Comparison', `Version ${version1} and Version ${version2} of document '${documentName}' are identical.`);
        } else {
          Logger.log('Version Comparison', `Version ${version1} and Version ${version2} of document '${documentName}' are different.`);
        }
      } else {
        Logger.error('Version Comparison', 'File system module (fs) is not available. Unable to compare versions.');
      }
    } catch (error) {
      Logger.error('Version Comparison', `Error comparing versions of document '${documentName}': ${error}`);
      throw error;
    }
  }}

// Example usage:
try {
  const documentVersioning = new DocumentVersioning('/path/to/data');
  documentVersioning.initializeVersions();
  const currentVersion = documentVersioning.getCurrentVersion('documentName');
  const newData = { /* Define your new data here */ };
  const version1 = 1;
  const version2 = 2;
  documentVersioning.generateNewVersion('documentName', newData);
  documentVersioning.compareVersions('documentName', version1, version2);
} catch (error) {
  Logger.error(`An error occurred: ${error}`);
}


