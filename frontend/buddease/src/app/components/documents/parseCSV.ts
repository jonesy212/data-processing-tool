//parseCSV.ts
import csvParser from "csv-parser";
import { Readable } from "stream";

/**
 * Parse CSV content and return an array of parsed rows.
 * @param csvContent The CSV content to parse.
 * @returns An array of parsed rows.
 */
export async function parseCSV(csvContent: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    // Create a readable stream from the CSV content string
    const stream = Readable.from(csvContent);

    // Use csv-parser to parse the CSV data
    stream
      .pipe(csvParser())
      .on("data", (data: any) => {
        results.push(data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error: Error) => {
        reject(error);
      });
  });
}
