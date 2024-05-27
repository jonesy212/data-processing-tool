// CloudStorageProvider.ts


interface FileMetadata {
  fileName: string;
  fileSize: number;
}

export class CloudStorageProvider {
    providerName: string;
    storageLimit: number;
    usedStorage: number;
    files: FileMetadata[];

    constructor(providerName: string, storageLimit: number, usedStorage: number) {
      this.providerName = providerName;
      this.storageLimit = storageLimit;
      this.usedStorage = usedStorage;
      this.files = [];

    }
  
    // Method to check if storage is full
    isStorageFull(): boolean {
      return this.usedStorage >= this.storageLimit;
    }
  
    // Method to upload a file to the cloud storage
    uploadFile(fileName: string, fileSize: number): void {
      if (this.isStorageFull()) {
        console.error("Storage is full. Cannot upload file.");
        return;
      }
  
      // Simulate file upload process
      console.log(`Uploading ${fileName} (${fileSize} MB) to ${this.providerName}...`);
      this.usedStorage += fileSize;
      console.log(`File uploaded successfully.`);
    }
  
    // Method to download a file from the cloud storage
    downloadFile(fileName: string): void {
      // Simulate file download process
      console.log(`Downloading ${fileName} from ${this.providerName}...`);
      console.log(`File downloaded successfully.`);
    }
  
  // Method to list all files in the cloud storage
  listFiles(): void {
    console.log(`Files in ${this.providerName}:`);
    this.files.forEach(file => {
      console.log(`${file.fileName} - ${file.fileSize} MB`);
    });
  }
  }
  