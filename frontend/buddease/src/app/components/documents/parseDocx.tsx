import { load } from 'cheerio';
import mammoth from "mammoth";
import path from "path";
import getAppPath from "../../../../appPath";
import { ParsedData } from "../crypto/parseData";
import { DocData, YourDocxType } from "./DocType";


// Function to load and parse a Docx file
const loadDocx = async (
  filePath: string
): Promise<{ parsedData: ParsedData<object>[] }> => {
  // Parse the Docx file using mammoth
  const result = await mammoth.convertToHtml({ path: filePath });

  // Get the raw text
  const text = result.value;
  // Parse the text into an object structure
  const $ = load(text);
  const parsedData: ParsedData<object>[] = [];
  $("w|p").each((i, el) => {
    const text = $(el).text();
    if (text) { 
      parsedData.push({
        text,
        data: {},
        pageNumber: i + 1,
      });
    }
  });
  return {
    parsedData,
  };
};

// Function to get the appropriate file path for the application version
const getAppVersionedPath = (versionNumber: string, appVersion: string): string => {
  // Get the root path of the application
  const appRootPath = getAppPath(versionNumber, appVersion);
  return appRootPath;
};

// Function to load Docx data based on application version
const loadDocxByVersion = async (
  versionNumber: string,
  appVersion: string,
  filePath: string
): Promise<YourDocxType[]> => {
  // Get the versioned app path
  const versionedAppPath = getAppVersionedPath(versionNumber, appVersion);

  // Construct the full file path
  const fullFilePath = path.join(versionedAppPath, filePath);

  // Load and parse the Docx file
  const docx = await loadDocx(fullFilePath);
  const docxData = docx as unknown as YourDocxType[];

  return docxData;
};

async function parseDocx<T extends object>(
  docxFilePath: string,
  parsedData: ParsedData<T>[]
): Promise<DocData<T>> {
  let docxData: YourDocxType[] = [];
  const docx = await loadDocx(docxFilePath);
  docxData = docx as unknown as YourDocxType[];
  parseDocxData(docxData, parsedData);

  return { docxData, parsedData } as DocData<T>;
}

// Function to parse Docx files and update DocxData with parsed data
function parseDocxData<T extends object>(
  docxData: YourDocxType[],
  parsedData: ParsedData<T>[]
): void {
  // Iterate through the Docx data and update the DocxData object with parsed data
  docxData.forEach((docx: YourDocxType) => {
    // Extract necessary information from the Docx file
    const extractedData: any = extractDocxData(docx); // Placeholder for extracted data

    // Example: Matching logic based on some identifier in parsedData
    const matchedParsedData = parsedData.find((data) => {
      // Implement your matching logic here
      return /* Your matching logic here */;
    });

    // If matchedParsedData exists, update the DocxData object with parsed data
    if (matchedParsedData) {
      // Update the DocxData object with parsed data
      // For example, you might update specific fields or merge the extracted data with existing data
      // Let's assume we're updating project details
      if (matchedParsedData.projectId === extractedData.projectId) {
        // Update project details with extracted data
        matchedParsedData.projectDetails = extractedData.projectDetails;
      }
    }
  });
}

// Function to extract content from a Docx file
function extractDocxData(docx: YourDocxType): any {
  // Implement logic to extract relevant data from the Docx file
  // This could involve using a Docx parsing library or other techniques
  // Placeholder implementation:
  // const extractedData = {
  //   someField: docx.extractedField,
  //   // Add more fields as needed
  // };
  // return extractedData;

  // Placeholder return value
  return {
    someField: "Extracted data from Docx file",
  };
}




// Example usage:
const versionNumber = '1.0';
const appVersion = 'latest';
const filePath = 'example.docx';

// Load Docx data based on the application version
const docxData = loadDocxByVersion(versionNumber, appVersion, filePath);
console.log('Docx Data:', docxData);

export { parseDocx };
