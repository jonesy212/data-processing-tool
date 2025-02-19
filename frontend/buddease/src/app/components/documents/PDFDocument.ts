export interface PDFDocument {
  // PDF document properties and methods...
  filePath: string; // Example property for file path
  addText(text: string): void; // Example method to add text to the PDF
  save(): Promise<void>; // Example method to save the PDF
}



