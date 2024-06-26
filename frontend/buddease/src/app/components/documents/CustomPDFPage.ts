import { GlobalWorkerOptions } from "pdfjs-dist";

import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";

GlobalWorkerOptions.workerSrc = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";

interface CustomPDFPage extends PDFPageProxy {
  getText(): Promise<string>;
}

// Utility function to add getText to a PDFPageProxy
function addGetTextMethod(page: PDFPageProxy): CustomPDFPage {
    const customPage = page as CustomPDFPage;
  
    customPage.getText = async function (): Promise<string> {
      try {
        const textContent = await this.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str).join(' ');
        return textItems;
      } catch (error) {
        console.error('Error fetching text content:', error);
        throw error;
      }
    };
  
    return customPage;
  }
  

// Function to implement the getText method
CustomPDFPage.prototype.getText = async function (): Promise<string> {
  const textContent = await this.getTextContent();
  const textItems = textContent.items.map((item: any) => item.str).join(" ");
  return textItems;
};

async function extractTextFromPage(page: CustomPDFPage): Promise<string> {
  const textContent = await page.getText();
  return textContent;
}


export {extractTextFromPage, addGetTextMethod}