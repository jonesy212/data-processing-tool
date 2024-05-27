// DocType.ts
import { ParsedData } from "../crypto/parseData";
import { PDFData } from "./parsePDF";

interface ModifiedDate extends Date {
  value: Date | undefined;
  isModified: boolean;
}

// export type DocType<T> = YourPDFType | YourDocxType | ParsedData<object>;
interface DocData<T extends object> {
  parsedData: ParsedData<T>[];
}

interface YourPDFType extends DocData<any> {
  // Define the structure of data extracted from the PDF file
    pageNumber: number;
    textContent: string;
    text: Promise<PDFData>
    // Add more fields as needed based on the content of your PDF files
}
  

interface YourDocxType extends DocData<any> {
  // Define the structure of data extracted from the Docx file
  paragraphNumber: number;
  content: string;
  parsedData: ParsedData<object>[];
  lastModifiedDate: ModifiedDate; // Updated type

  // Add more fields as needed based on the content of your Docx files
}

  
  export type { DocData, ModifiedDate, ParsedData, YourDocxType, YourPDFType };
