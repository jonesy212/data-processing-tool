import * as fs from 'fs';
import * as path from 'path';
import Logger from '@/app/pages/logging/Logger';

class DocumentVersioning {
  private versions: { [key: string]: number } = {};
  private dataPath: string;

  constructor(dataPath: string) {
    this.dataPath = dataPath;
  }

  // Method to initialize versions based on existing files in the data path
  initializeVersions(): void {
    try {
      const files = fs.readdirSync(this.dataPath);
      for (const file of files) {
        const filePath = path.join(this.dataPath, file);
        const isDirectory = fs.statSync(filePath).isDirectory();

        if (!isDirectory && file.endsWith('.json')) {
          const dataKey = path.basename(file, path.extname(file));
          this.versions[dataKey] = 0; // Initialize with version 0
        }
      }
    } catch (error) {
      Logger.error(`Error initializing document versions: ${error}`);
      throw error; // Propagate the error for higher-level handling
    }
  }

  // Method to retrieve the current version of a document
  getCurrentVersion(documentName: string): number {
    return this.versions[documentName] || 0;
  }

  // Method to increment the version of a document
  incrementVersion(documentName: string): void {
    this.versions[documentName] = (this.versions[documentName] || 0) + 1;
  }

  // Method to log version changes
  logVersionChange(documentName: string, newVersion: number): void {
    Logger.log(`Version of document '${documentName}' updated to ${newVersion}`);
  }

  // Method to generate a new version of a document
  generateNewVersion(documentName: string, newData: any): void {
    try {
      const currentVersion = this.getCurrentVersion(documentName);
      const newVersion = currentVersion + 1;
      
      // Update the document with new data (e.g., save to file/database)
      // Example: updateDocument(documentName, newData);

      // Increment version and log the change
      this.incrementVersion(documentName);
      this.logVersionChange(documentName, newVersion);
    } catch (error) {
      Logger.error(`Error generating new version for document '${documentName}': ${error}`);
      throw error; // Propagate the error for higher-level handling
    }
  }
    
  // Method to compare versions of a document
  compareVersions(documentName: string, version1: number, version2: number): void {
    try {
      const filePath = path.join(this.dataPath, `${documentName}_${version1}.json`);
      const filePath2 = path.join(this.dataPath, `${documentName}_${version2}.json`);

      const data1 = fs.readFileSync(filePath, 'utf-8');
      const data2 = fs.readFileSync(filePath2, 'utf-8');

      // Compare the contents of the documents
      if (data1 === data2) {
        Logger.log(`Version ${version1} and Version ${version2} of document '${documentName}' are identical.`);
      } else {
        Logger.log(`Version ${version1} and Version ${version2} of document '${documentName}' are different.`);
      }
    } catch (error) {
      Logger.error(`Error comparing versions of document '${documentName}': ${error}`);
      throw error; // Propagate the error for higher-level handling
    }
  }
}

// Example usage:
// Example usage:
try {
    // Instantiate DocumentVersioning with the data path
    const documentVersioning = new DocumentVersioning('/path/to/data');
  
    // Initialize versions based on existing files
    documentVersioning.initializeVersions();
  
    // Get current version of a document
    const currentVersion = documentVersioning.getCurrentVersion('documentName');
  
    // Assuming newData, version1, and version2 are defined elsewhere in your code
    const newData = { /* Define your new data here */ };
    const version1 = 1; // Example version number
    const version2 = 2; // Example version number
  
    // Generate a new version of a document with updated data
    documentVersioning.generateNewVersion('documentName', newData);
  
    // Compare versions of a document
    documentVersioning.compareVersions('documentName', version1, version2);
  } catch (error) {
    Logger.error(`An error occurred: ${error}`);
  }
  
