// decompress.ts
import pako from "pako";

/**
 * Decompresses a base64-encoded compressed string in the browser.
 * @param compressedData - Base64 string of compressed JSON
 * @returns Decompressed object
 */
export const decompress = async (compressedData: string): Promise<any> => {
  try {
    const binaryString = atob(compressedData); // decode base64
    const charData = binaryString.split("").map(c => c.charCodeAt(0));
    const binData = new Uint8Array(charData);
    const decompressed = pako.inflate(binData, { to: "string" });
    return JSON.parse(decompressed);
  } catch (error) {
    throw new Error(`Failed to decompress data: ${error}`);
  }
};
