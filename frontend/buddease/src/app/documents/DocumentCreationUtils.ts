// DocumentCreationUtils.ts
import { DocumentFormattingOptions } from '@/app/components/documents/DocumentFormattingOptionsComponent';
import { PDFDocument, rgb } from '@/app/documents/editing/PDFDocument';


export const getFormattedOptions = (userOptions: DocumentFormattingOptions): DocumentFormattingOptions => {
  // Define default options
    const defaultOptions:DocumentFormattingOptions  = {
      fontSize: 12,
      textColor: '#000000',
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      bold: false,
      italic: false,
      underline: false,
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      // Add more default options as needed
    };
  
    // Merge user options with default options
    const formattedOptions = { ...defaultOptions, ...userOptions };
  
    // Additional formatting logic can be added here based on specific requirements
  
    return formattedOptions;
};
  

export const createPdfDocument = async (content: string, options: any) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    // Add content to the page
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont("Helvetica");

    // Format the content based on options
    const formattedContent = formatContent(content, options, width);

    // Add formatted content to the page
    page.drawText(formattedContent, {
      font,
      size: options.fontSize || 12,
      color: rgb(0, 0, 0),
      x: 50,
      y: height - 100,
    });

    // Save the document
    const pdfBytes = await pdfDoc.save();
    
    // Fix: Use type assertion to handle the Uint8Array
    const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

  } catch (error) {
    console.error('Error creating PDF document:', error);
    throw error;
  }
};

const formatContent = (content: string, options: DocumentFormattingOptions, width: number): string => {
  // Implement logic to format content based on options
  let formattedContent = content;

  // Example: Apply bold formatting
  if (options.bold) {
    formattedContent = `<b>${formattedContent}</b>`;
  }

    // Example: Apply width-based formatting
    if (width > 500) {
      formattedContent = `<div style="font-size: 18px;">${formattedContent}</div>`;
    }
  

  // Add more formatting options as needed

  return formattedContent;
};
