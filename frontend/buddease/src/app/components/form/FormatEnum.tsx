// FormatEnum.ts

import { DatabaseConfig } from "@/app/configs/DatabaseConfig";
import { CustomDocxtemplater, DocumentPath } from "../documents/DocumentGenerator";
import { WritableDraft } from "../state/redux/ReducerGenerator";

enum FormatEnum {
    JSON = "json",
    XML = "xml",
    CSV = "csv",
    XLS = "xls",
    XLSX = "xlsx",
    // Add more formats as needed
  }
  
  export default FormatEnum;

  
// Define the allowed diagram formats
const allowedDiagramFormats: FormatEnum[] = [
  FormatEnum.JSON,
  FormatEnum.XML,
  FormatEnum.CSV,
  FormatEnum.XLS,
  FormatEnum.XLSX
]; // Updated list of allowed diagram formats


async function loadJsonContent(
  draftId: string | undefined,
  document: DocumentPath,
  config: DatabaseConfig
): Promise<any> {
  const jsonContent = await fetchJsonDocumentByIdAPI(
    draftId,
    config
  );

  return jsonContent;
}
// Function to load document content
async function loadDocumentContent(
  draftId: string | undefined,
  document: DocumentPath,
  newContent: CustomDocxtemplater<any>,
  dataCallback: (data: WritableDraft<DocumentPath>) => void,
  format: FormatEnum,
  docx?: CustomDocxtemplater<any>,
  config?: DatabaseConfig,
  documentId?: number,
  formData?: FormData,
): Promise<string | undefined> {
  let content: string | undefined;

  switch (format) {
    case FormatEnum.JSON:
      content = await loadJsonContent(
        draftId,
        document,
        config
      );
      break;

    case FormatEnum.XML:
      content = await loadXmlContent(
        draftId,
        document,
        config
      );
      break;
      
    // Add more cases for other formats as needed

    default:
      console.error(`Unsupported document format: ${format}`);
      break;
  }

  return content;
}

async function loadDocumentContentByFormat(format: FormatEnum): Promise<string | undefined> {
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
