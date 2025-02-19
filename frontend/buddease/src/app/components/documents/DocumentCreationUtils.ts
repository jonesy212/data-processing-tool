// DocumentCreationUtils.ts
import { PDFDocument, rgb } from 'pdf-lib';
import { DocumentFormattingOptions } from './ DocumentFormattingOptionsComponent';


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
      margin: 20,
      // Add more default options as needed
    };
  
    // Merge user options with default options
    const formattedOptions = { ...defaultOptions, ...userOptions };
  
    // Additional formatting logic can be added here based on specific requirements
  
    return formattedOptions;
};
  

export const createPdfDocument = async (content: string, options: any) => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  // Add content to the page
  const { width, height } = page.getSize();
 // Use the `embedFont` method without referencing `Font.Helvetica`
 const font = await pdfDoc.embedFont("Helvetica");

 // Format the content based on options
 const formattedContent = formatContent(content, options, width);

  // Add formatted content to the page
  page.drawText(formattedContent, {
    font,
    size: options.fontSize || 12,
    color: rgb(0, 0, 0), // Customize color based on options
    x: 50,
    y: height - 100,
  });

  // Add more content and formatting as needed

  // Save the document or display it as needed
  const pdfBytes = await pdfDoc.save();
  // Example: Display the PDF in a new window
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
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
