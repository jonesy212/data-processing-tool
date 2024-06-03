// MarkdownDocument.ts

export interface MarkdownDocument {
    // Markdown document properties and methods...
    id: string;
    title: string;
    content: string;
    htmlContent: string;
    // Example method to convert Markdown to HTML
    convertToHTML(markdown: string): void;
  }