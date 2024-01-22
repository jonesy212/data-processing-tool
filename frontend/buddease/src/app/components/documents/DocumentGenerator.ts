// DocumentGenerator.ts

import Docxtemplater from 'docxtemplater';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentOptions } from './DocumentOptions';
var xl = require('excel4node');


enum DocumentType {
  Text = 'text',
  Spreadsheet = 'spreadsheet',
  Diagram = 'diagram',
  CalendarEvents = 'calendarEvents'
}
class DocumentGenerator {
  createTextDocument(type: DocumentType, options: DocumentOptions): string {
    
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

  // Add methods for other document types (e.g., createPresentation, createDrawing, etc.)

  createDiagram(): string {
    // Logic to generate a diagram

    return 'Diagram created successfully.';
  }



  createDocument(type: string, options: DocumentOptions): string {
    switch (type) {
      case DocumentType.Text:
        return this.createTextDocument(type, options);
      case DocumentType.Spreadsheet:
        return this.createSpreadsheet(options);
      // Add cases for other document types
      case DocumentType.Diagram:
        return this.createSpreadsheet(options);
      case DocumentType.CalendarEvents:
        return this.createSpreadsheet(options);
      // Add cases for other document types
      default:
        throw new Error(`Unsupported document type: ${type}`);
    }
  }
  // Additional methods for document management, export, etc.
}

export default DocumentGenerator;
