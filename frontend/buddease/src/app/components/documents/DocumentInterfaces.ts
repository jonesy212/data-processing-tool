import { CommonDocumentPropertiesAndMethods } from "./CommonDocumentPropertiesAndMethods";

// Interfaces
export interface PDFDocument extends CommonDocumentPropertiesAndMethods {
  filePath: string;
  addText(text: string): void;
  save(): Promise<void>;
  
}

export interface MarkdownDocument extends CommonDocumentPropertiesAndMethods {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  convertToHTML(markdown: string): void
}


export interface SQLDocument extends CommonDocumentPropertiesAndMethods {
  query: string;
  execute(): Promise<void>;
}
