// DocType.ts
interface YourPDFType {
    // Define the structure of data extracted from the PDF file
    pageNumber: number;
    textContent: string;
    // Add more fields as needed based on the content of your PDF files
  }
  

  interface YourDocxType {
    // Define the structure of data extracted from the Docx file
    paragraphNumber: number;
    content: string;
    // Add more fields as needed based on the content of your Docx files
  }

  
  export type {
    YourPDFType,
    YourDocxType
  }