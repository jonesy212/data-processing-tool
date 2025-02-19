// MarkdownDoc.ts

import { MarkdownDocument } from "./DocumentInterfaces";

// MarkdownDocument Implementation
class MarkdownDoc implements MarkdownDocument {
    id: string;
    title: string;
    content: string;
    htmlContent: string;
    author: string;
  
    constructor(id: string, title: string, content: string, author: string) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.author = author;
      this.htmlContent = '';
    }
  
    getTitle(): string {
      return this.title;
    }
  
    getAuthor(): string {
      return this.author;
    }
  
    printInfo(): void {
      console.log(`Title: ${this.getTitle()}, Author: ${this.getAuthor()}`);
    }
  
    convertToHTML(markdown: string): void {
      this.htmlContent = markdown; // Here, convert markdown to HTML logic should be implemented
    }
  }
  
export default MarkdownDoc
  
// Creating and using a MarkdownDocument
const markdownDoc = new MarkdownDoc('1', 'Markdown Title', '# Markdown Content', 'Author Name');
markdownDoc.printInfo();
markdownDoc.convertToHTML(markdownDoc.content);
