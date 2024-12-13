import { DocumentTypeEnum } from "../../documents/DocumentGenerator";

// determineDocumentType.ts
function determineDocumentType(options: {
  content: string;
  filePathOrUrl?: string;
  format?: string;
}): DocumentTypeEnum {
  const { content, filePathOrUrl, format } = options;

  // Determine document type based on file extension or content
  if (filePathOrUrl?.endsWith(".pdf") || format === "pdf") {
    return DocumentTypeEnum.PDFDocument;
  } else if (filePathOrUrl?.endsWith(".docx") || format === "word") {
    return DocumentTypeEnum.Document;
  } else if (filePathOrUrl?.endsWith(".xlsx") || format === "spreadsheet") {
    return DocumentTypeEnum.Spreadsheet;
  } else if (filePathOrUrl?.endsWith(".sql") || format === "sql") {
    return DocumentTypeEnum.SQLDocument;
  } else if (filePathOrUrl?.endsWith(".pptx") || format === "presentation") {
    return DocumentTypeEnum.Presentation;
  } else if (filePathOrUrl?.endsWith(".md") || format === "markdown") {
    return DocumentTypeEnum.MarkdownDocument;
  } else if (filePathOrUrl?.endsWith(".design") || format === "design") {
    return DocumentTypeEnum.Design;
  } else if (content.includes("Market Analysis")) {
    return DocumentTypeEnum.MarketAnalysis;
  } else if (content.includes("Financial Report")) {
    return DocumentTypeEnum.FinancialReport;
  } else if (format === "template") {
    return DocumentTypeEnum.Template;
  } else {
    return DocumentTypeEnum.Other;
  }
}

  
  export {determineDocumentType}