// DocumentGenerator.ts

import Docxtemplater from 'docxtemplater';
import * as path from 'path';
import { DocumentOptions, getDefaultDocumentOptions } from './DocumentOptions';
import generateFinancialReportContent from './documentation/report/generateFinancialReportContent';
import { Document } from '../state/stores/DocumentStore';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { DocumentData } from './DocumentBuilder';
import { saveDocumentToDatabase, saveTradeToDatabase } from '@/app/configs/database/updateDocumentInDatabase';
import { DatasetModel } from '../todos/tasks/DataSetModel';
 var xl = require('excel4node');



 interface CustomDocxtemplater<TZip> extends Docxtemplater<TZip> {
  load(content: any): void;
 }
 type DocumentPath = DocumentData | DatasetModel;

enum DocumentTypeEnum {
  Text = 'text',
  Spreadsheet = 'spreadsheet',
  Diagram = 'diagram',
  CalendarEvents = 'calendarEvents',
  Drawing = 'drawing',
  Presentation = 'presentation',
  CryptoWatch = 'cryptowatch',
  Draft = 'draft',
  Document = 'document',
  Other = 'other',
  FinancialReport = 'financialReport',
  MarketAnalysis = 'marketAnalysis',
  ClientPortfolio = 'clientPortfolio',
}



enum DocumentStatusEnum {
  Draft = 'draft',
  Finalized = 'finalized',
  Archived = 'archived',
  Deleted = 'deleted'
}



const documents: Document[] = [
  {
    id: 1,
    title: 'Financial Report',
    type: DocumentTypeEnum.FinancialReport,
    status: DocumentStatusEnum.Draft,
    description: 'Financial Report Description',
    content: 'Financial Report Content',
    createdAt: '2021-07-01T00:00:00.000Z',
    updatedAt: '2021-07-01T00:00:00.000Z',
    createdBy: 'John Doe',
    updatedBy: 'John Doe',
    
    folderPath: "documents/financial-reports",
    previousMetadata: {} as StructuredMetadata,
    currentMetadata: {} as StructuredMetadata,
    accessHistory: [],
    documentData: {
      financialReport: {
        financialReportContent: 'Financial Report Content',
        financialReportFileName: 'financial_report.docx',
      }
    },
    tags: ['financial', 'report', '2021'],
    topics: [
      'goals',
      'executive summary',
      'financial report',
    ],
    highlights: [
      'goals',
      'objectives',
    ],
    keywords: [],
    files: [],
    options: getDefaultDocumentOptions()
  },
  // Add more documents as needed
];

// Add the namespace declaration for DXT if it's not already imported
declare namespace DXT {
  // Define your types here...
}




function loadTextDocumentContent(document: DocumentData): string {
  // Logic to load content for a text document
  // Example: Load content from a database or a cloud storage service

  // Assuming the text content is stored in the document's `content` property
  const textContent = document.content;

  // todo You can replace the above line with logic to fetch the content from a database or a cloud storage service
  // For example, if the content is stored in a database:
  // const textContent = fetchTextContentFromDatabase(document.id);

  // Or if the content is stored in a cloud storage service like AWS S3:
  // const textContent = downloadTextContentFromS3(document.url);

  // Return the loaded text content
  return textContent;
}




function loadSpreadsheetDocumentContent(document: DocumentData): string { 
  // Logic to load content for a spreadsheet document
  // For example, if the content is stored in a database:
  const workbook = new xl.Workbook();
  const sheet = workbook.addWorksheet();
  sheet.cell(1, 1).string(document.content);
  // Return the loaded spreadsheet content
  return workbook.xlsx();

}




class DocumentGenerator {
  createTextDocument(type: DocumentTypeEnum, options: DocumentOptions, fileContent: Buffer): string {
    const content = options.content || 'Default Text Document Content';
    const contentData = { content }; // Data to fill in the template
    const docx = new Docxtemplater() as CustomDocxtemplater<any>;
    docx.load(fileContent); // Load content directly instead of reading from file
    docx.setData(contentData);

    try {
      docx.render();
      const result = docx.getZip().generate({ type: 'nodebuffer' });
      // Adjust this part according to your use case. For example, you can return the buffer or save it to a file.
      // Example of returning the buffer:
      // return result;
      return 'Text Document created successfully.';
    } catch (error) {
      console.error('Error creating text document:', error);
      return 'Error creating text document.';
    }
  }

  
  





  loadDocumentContent(document: DocumentPath, docx: CustomDocxtemplater<any>): string | undefined {
    switch(document.type) {
      case DocumentTypeEnum.Text:
        // Logic to load content for a text document
        return loadTextDocumentContent(document);
      case DocumentTypeEnum.Spreadsheet:
      // Logic to load content for a spreadsheet document
      //   todo add document types
        return loadSpreadsheetDocumentContent(document);
      case DocumentTypeEnum.Diagram:
        // Logic to load content for a diagram document
        return loadDiagramDocumentContent(document);
      case DocumentTypeEnum.CalendarEvents:
      //   // Logic to load content for a calendar events document
      //   return loadCalendarEventsDocumentContent(document);
      // case DocumentTypeEnum.Drawing:
      //   // Logic to load content for a drawing document
      // //   return loadDrawingDocumentContent(document);
      // // case DocumentTypeEnum.Presentation:
      // //   // Logic to load content for a presentation document
      // //   return loadPresentationDocumentContent(document);
      // // case DocumentTypeEnum.CryptoWatch:
      // //   // Logic to load content for a CryptoWatch document
      // //   return loadCryptoWatchDocumentContent(document);
      // // case DocumentTypeEnum.Draft:
      // //   // Logic to load content for a draft document
      // //   return loadDraftDocumentContent(document);
      // // case DocumentTypeEnum.Document:
      //   // Logic to load content for a generic document
      //   return loadGenericDocumentContent(document);
      // case DocumentTypeEnum.Other:
      //   // Logic to load content for another type of document
      //   return loadOtherDocumentContent(document);
      // case DocumentTypeEnum.FinancialReport:
      //   // Logic to load content for a financial report document
      //   return loadFinancialReportDocumentContent(document);
      // case DocumentTypeEnum.MarketAnalysis:
      //   // Logic to load content for a market analysis document
      //   return loadMarketAnalysisDocumentContent(document);
      // case DocumentTypeEnum.ClientPortfolio:
      //   // Logic to load content for a client portfolio document
      //   return loadClientPortfolioDocumentContent(document);
      default:
        console.error(`Unsupported document type: ${document.type}`);
        return undefined; // Return undefined for unsupported document types
    }
  }
  
  



  createCalendarEvents(options: DocumentOptions): string {
    // Real-world logic to create a document for calendar events
    // Use the provided CalendarWrapper or implement logic to handle calendar events

    return 'Calendar Events Document created successfully.';
  }


  saveDocumentContent(document: DatasetModel, content: string) { 
    // Logic to save the loaded/generated content

    // Example:
    // Save to database
    saveDocumentToDatabase(document, content);
  }


  createSpreadsheet(options: DocumentOptions): string {
   // Real-world logic to create a spreadsheet using excel4node
const wb = new xl.Workbook(); // Create a new Workbook instance
const ws = wb.addWorksheet('Sheet 1'); // Add a worksheet

// Set cell values based on options or provide default content
const content = options.content || 'Default Spreadsheet Content';
ws.cell(1, 1).string(content);

// Save the workbook
wb.write('spreadsheet.xlsx');

    return 'Spreadsheet created successfully.';
  }
  

  manageDocument(documentPath: DocumentPath, newContent: CustomDocxtemplater<any>): string {
    // Real-world logic to manage existing documents
    try {
      // Load the existing document content
      const existingContent = this.loadDocumentContent(documentPath, newContent);

      // Perform actions on the existing document content (e.g., append, modify, etc.)
      const updatedContent = `${existingContent}\nUpdated Content: ${newContent}`;

      // Save the updated content to the document
      this.saveDocumentContent(documentPath, updatedContent);

      return 'Document managed successfully.';
    } catch (error) {
      console.error('Error managing document:', error);
      return 'Error managing document.';
    }
  }

  exportDocument(documentPath: string, exportPath: string): string {
    // Real-world logic to export documents
    try {
      // Load the content of the document to export
      const fileContent = this.loadDocumentContent(documentPath);

      // Save the content to the export path
      this.saveDocumentContent(exportPath, fileContent);

      return 'Document exported successfully.';
    } catch (error) {
      console.error('Error exporting document:', error);
      return 'Error exporting document.';
    }
  }


  createDrawing(options: DocumentOptions): string {
    const templatePath = path.join(__dirname, 'templates', 'drawingTemplate.svg');
    const content = options.content || 'Default Drawing Content';

    // Example: Use a placeholder library for drawings
    const drawingLibrary = require('drawingLibrary');

    // Replace 'drawingLibrary.createDrawing' with the actual method
    const drawing = drawingLibrary.createDrawing(templatePath, content);

    try {
      // Perform any additional logic specific to the chosen drawing library
      // Save the drawing or perform other operations as needed

      return 'Drawing created successfully.';
    } catch (error) {
      console.error('Error creating drawing:', error);
      return 'Error creating drawing.';
    }
  }

  createPresentation(options: DocumentOptions): string {
    const templatePath = path.join(__dirname, 'templates', 'presentationTemplate.pptx');
    const content = options.content || 'Default Presentation Content';

    // Example: Use a placeholder library for presentations
    const presentationLibrary = require('presentationLibrary');

    // Replace 'presentationLibrary.createPresentation' with the actual method
    const presentation = presentationLibrary.createPresentation(templatePath, content);

    try {
      // Perform any additional logic specific to the chosen presentation library
      // Save the presentation or perform other operations as needed

      return 'Presentation created successfully.';
    } catch (error) {
      console.error('Error creating presentation:', error);
      return 'Error creating presentation.';
    }
  }



  createFinancialReport(options: DocumentOptions): string {
    // Real-world logic to create a financial report
    // Use the provided FinancialReportWrapper or implement logic to handle financial reports

    // Example: Generating a financial report document
    const financialReportContent = 'Financial Report Content';
    const financialReportFileName = 'financial_report.docx'; // Example filename
  



    try {
      // Perform logic to generate the financial report document
        generateFinancialReportContent(options,  documents);
      // For demonstration purposes, let's assume the document generation is successful
      // and write the content to a file
      fs.writeFileSync(financialReportFileName, financialReportContent);
      
      return 'Financial Report created successfully.';
    } catch (error) {
      console.error('Error creating financial report:', error);
      return 'Error creating financial report.';
    }
  }
  

  // Add methods for other document types (e.g., createPresentation, createDrawing, etc.)

  createDiagram(): string {
    // Logic to generate a diagram
    return 'Diagram created successfully.';
  }


  createDocument(type: string, options: DocumentOptions): string {
    switch (type) {
      case DocumentTypeEnum.Text:
        return this.createTextDocument(type, options);
      case DocumentTypeEnum.Spreadsheet:
        return this.createSpreadsheet(options);
      // Add cases for other document types
      case DocumentTypeEnum.Diagram:
        return this.createSpreadsheet(options);
      case DocumentTypeEnum.CalendarEvents:
        return this.createSpreadsheet(options);
      // Add cases for other document types
      case DocumentTypeEnum.Drawing:
        return this.createDrawing(options);
      case DocumentTypeEnum.Presentation:
        return this.createPresentation(options);
      case DocumentTypeEnum.CryptoWatch:
        return this.createSpreadsheet(options);
      case DocumentTypeEnum.Other: 
        return this.createSpreadsheet(options);
      // Add cases for other document types
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }
  }
  // Additional methods for document management, export, etc.
}

export default DocumentGenerator;
export { DocumentStatusEnum, DocumentTypeEnum };

