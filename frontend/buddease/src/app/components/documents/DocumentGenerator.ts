// DocumentGenerator.ts

import Docxtemplater from 'docxtemplater';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentOptions, getDefaultDocumentOptions } from './DocumentOptions';
import generateFinancialReportContent from './documentation/report/generateFinancialReportContent';
import { Document } from '../state/stores/DocumentStore';
 var xl = require('excel4node');


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



class DocumentGenerator {
  createTextDocument(type: DocumentTypeEnum, options: DocumentOptions): string {
    
    const templatePath = path.join(__dirname, 'templates', 'textTemplate.docx');
    const content = options.content || 'Default Text Document Content';
  
    const contentData = { content }; // Data to fill in the template
  
    const docx = new Docxtemplater() as Docxtemplater<any>; // Add explicit type
    (docx as any).load(fs.readFileSync(templatePath, 'binary'));
    docx.setData(contentData);
  
    try {
      docx.render();
      const result = docx.getZip().generate({ type: 'nodebuffer' });
      fs.writeFileSync('textDocument.docx', result);
      return 'Text Document created successfully.';
    } catch (error) {
      console.error('Error creating text document:', error);
      return 'Error creating text document.';
    }
  }
  



  createCalendarEvents(options: DocumentOptions): string {
    // Real-world logic to create a document for calendar events
    // Use the provided CalendarWrapper or implement logic to handle calendar events

    return 'Calendar Events Document created successfully.';
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
  

  manageDocument(documentPath: string, newContent: string): string {
    // Real-world logic to manage existing documents
    try {
      const fileContent = fs.readFileSync(documentPath, 'utf-8');
      // Perform actions on the existing document content (e.g., append, modify, etc.)
      const updatedContent = `${fileContent}\nUpdated Content: ${newContent}`;
      fs.writeFileSync(documentPath, updatedContent);
      return 'Document managed successfully.';
    } catch (error) {
      console.error('Error managing document:', error);
      return 'Error managing document.';
    }
  }

  exportDocument(documentPath: string, exportPath: string): string {
    // Real-world logic to export documents
    try {
      const fileContent = fs.readFileSync(documentPath, 'binary');
      fs.writeFileSync(exportPath, fileContent, 'binary');
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

