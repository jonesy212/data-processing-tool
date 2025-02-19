// FormatEnum.ts

import {
  fetchJsonDocumentByIdAPI,
  fetchXmlDocumentByIdAPI,
} from "@/app/api/ApiDocument";
import { DatabaseConfig } from "@/app/configs/DatabaseConfig";
import {
  CustomDocxtemplater,
  DocumentPath,
} from "../documents/DocumentGenerator";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { BaseData } from "../models/data/Data";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

enum FormatEnum {
  JSON = "json",
  XML = "xml",
  CSV = "csv",
  XLS = "xls",
  XLSX = "xlsx",
  PDF = "pdf",
  DOCX = "docx",
  DOC = "doc",
  
  // Add more formats as needed
}

export default FormatEnum;

// Define the allowed diagram formats
const allowedDiagramFormats: FormatEnum[] = [
  FormatEnum.JSON,
  FormatEnum.XML,
  FormatEnum.CSV,
  FormatEnum.XLS,
  FormatEnum.XLSX,
]; // Updated list of allowed diagram formats

async function loadJsonContent(
  draftId: string,
  document: DocumentPath<BaseData, BaseData, StructuredMetadata<BaseData, BaseData>>, // Provide appropriate types here
  config: DatabaseConfig,
  dataCallback: (data: any) => void
): Promise<any> {
  try {
    const jsonContent = await fetchJsonDocumentByIdAPI(
      draftId,
      config,
      dataCallback
    );
    return jsonContent;
  } catch (error) {
    // Handle error if necessary
  }
}

async function loadXmlContent(
  draftId: string,
  document: DocumentPath<BaseData, BaseData, StructuredMetadata<BaseData, BaseData>>, // Provide appropriate types here
  config: DatabaseConfig,
  dataCallback: (data: any) => void
): Promise<any> {
  // Fetch XML content from API
  const response = await fetchXmlDocumentByIdAPI(draftId, config, dataCallback);

  return response;
}

async function csvToJson(csvContent: string) {
  // parse CSV string to JSON
  const csv = require("csvtojson");
  const jsonContent = await csv.toJSON(csvContent);
  return jsonContent;
}

// Function to load document content
async function loadDocumentContent(
  draftId: string,
  document: DocumentPath<BaseData, BaseData, StructuredMetadata<BaseData, BaseData>>,
  newContent: CustomDocxtemplater<any>,
  dataCallback: (data: WritableDraft<DocumentPath<BaseData, BaseData, StructuredMetadata<BaseData, BaseData>>>) => void,
  format: FormatEnum,
  docx?: CustomDocxtemplater<any>,
  config?: DatabaseConfig,
  documentId?: number,
  formData?: FormData
): Promise<string | undefined> {
  let content: string | undefined;
  if (config) {
    switch (format) {
      case FormatEnum.JSON:
        content = await loadJsonContent(
          draftId,
          document,
          config,
          dataCallback
        );
        break;

      case FormatEnum.XML:
        content = await loadXmlContent(draftId, document, config, dataCallback);
        break;
      case FormatEnum.CSV:
        if (content) {
          content = await csvToJson(content);
        }
      // Add more cases for other formats as needed

      default:
        console.error(`Unsupported document format: ${format}`);
        break;
    }

    return content;
  }
  return content;
}

async function loadDocumentContentByFormat(
  format: FormatEnum
): Promise<string | undefined> {
  // Check the format and handle accordingly
  switch (format) {
    case FormatEnum.JSON:
      // Logic for loading JSON document content
      break;
    case FormatEnum.XML:
      // Logic for loading XML document content
      break;
    case FormatEnum.CSV:
      // Logic for loading CSV document content
      break;
    case FormatEnum.XLS:
    case FormatEnum.XLSX:
      // Logic for loading Excel document content
      break;
    default:
      console.error(`Unsupported document format: ${format}`);
      return undefined;
  }
}


export {allowedDiagramFormats}