// FileLoadOptions.ts
import { isBrowser } from './../utils/isBrowser';
import axiosInstance from "@/app/components/security/csrfToken";

type FileLoadOptions = {
  filePath: string; // The path to the file (could be a URL or local path)
  isLocalFileUpload?: boolean; // Flag indicating if the file comes from a local file input (browser)
};

const loadFile = async ({ filePath, isLocalFileUpload }: FileLoadOptions): Promise<Blob> => {
  if (isBrowser()) {
    // Handle file loading in the browser
    if (isLocalFileUpload) {
      // If it's a local file selected by the user via an <input type="file"> element
      return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            resolve(file); // Resolve with the file
          } else {
            reject(new Error("No file selected"));
          }
        };
        input.click(); // Simulate file selection dialog
      });
    } else if (filePath.startsWith("http")) {
      // For files accessible via URL (e.g., from the server or cloud storage)
      try {
        const response = await axiosInstance.get(filePath, { responseType: "blob" });
        return response.data; // Return the file as a Blob
      } catch (error) {
        throw new Error(`Error loading file from URL: ${filePath}`);
      }
    } else {
      // Optionally handle Local Storage case for files stored in localStorage
      const storedFile = localStorage.getItem(filePath); // Retrieve file from local storage
      if (storedFile) {
        return new Blob([storedFile], { type: "application/octet-stream" });
      }
      throw new Error(`No file found in localStorage at ${filePath}`);
    }
  } else {
    // Handle server-side (Node.js) file loading
    try {
      // For server-side, use axiosInstance to fetch the file from a URL
      const response = await axiosInstance.get(filePath, { responseType: "blob" });
      return response.data; // Return file as Blob
    } catch (error) {
      throw new Error(`Error loading file from URL (server): ${filePath}`);
    }
  }
};

export default loadFile;
