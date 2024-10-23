// import { PDFDocument as PdfLibDocument, rgb } from 'pdf-lib';
import { PDFDocument } from './DocumentInterfaces';
import { PDFDocument as PdfLibDocument, rgb, StandardFonts } from 'pdf-lib';

// PDFDocument Implementation
class PDFDoc implements PDFDocument {
  filePath: string;
  title: string;
  author: string;

  constructor(filePath: string, title: string, author: string) {
    this.filePath = filePath;
    this.title = title;
    this.author = author;
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

  async addText(text: string): Promise<void> {
    const pdfDoc = await PdfLibDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(text, {
      x: 50,
      y: 700,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  async save(): Promise<void> {
    console.log('Saving PDF document...');
  }
}


// Creating and using a PDFDocument
const pdfDoc = new PDFDoc('path/to/pdf', 'PDF Title', 'Author Name');
pdfDoc.printInfo();
pdfDoc.addText('Hello, World!').then(() => {
  pdfDoc.save();
});
