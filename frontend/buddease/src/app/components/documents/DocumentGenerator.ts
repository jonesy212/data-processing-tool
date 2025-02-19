import { ModifiedDate } from '@/app/components/documents/DocType';
var PizZip = require("pizzip");
import { FileActions } from "@/app/components/actions/FileActions";
import Draft from "immer";
// DocumentGenerator.ts
import calendarApiService from "@/app/api/ApiCalendar";
import {
  fetchDocumentByIdAPI,
  generateDocument,
  // getDocument,
  loadPresentationFromDatabase,
} from "@/app/api/ApiDocument";
import { DatabaseConfig } from "@/app/configs/DatabaseConfig";
import { T, K, Meta} from "@/app/components/models/data/dataStoreMethods";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import {
  loadDrawingFromDatabase,
  saveDocumentToDatabase,
} from "@/app/configs/database/updateDocumentInDatabase";
import { generateDiagram } from "@/app/generators/diagramGenerationLibrary";
import generateDraftJSON from "@/app/generators/generateDraftJSON";
import {} from "@faker-js/faker";
import Docxtemplater from "docxtemplater";
import { DrawingFunctions, DrawingOptions } from "drawingLibrary";
import fs from "fs";
import Papa from "papaparse";
import * as path from "path";
import { PDFDocument, PDFPage } from "pdf-lib";
import { loadCryptoWatchlistFromDatabase } from "../crypto/CryptoWatchlist";
import { generateCryptoWatchlistJSON } from "../crypto/generateCryptoWatchlistJSON";
import { ParsedData } from "../crypto/parseData";
import loadDraftFromDatabase from "../database/loadDraftFromDatabase";
import FormatEnum, { allowedDiagramFormats } from "../form/FormatEnum";
import useErrorHandling from "../hooks/useErrorHandling";
import { generatePresentationJSON } from "../libraries/presentations/generatePresentationJSON";
import { FileLogger } from "../logging/Logger";
import Tracker from "../models/tracker/Tracker";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { Document } from "../state/stores/DocumentStore";
import { DatasetModel } from "../todos/tasks/DataSetModel";
import { userId, userService } from "../users/ApiUser";
import { DocumentData } from "./DocumentBuilder";
import { DocumentOptions, getDefaultDocumentOptions } from "./DocumentOptions";
import { generateFinancialReportContent } from "./documentation/report/generateFinancialReportContent";
import { autosaveDrawing } from "./editing/autosaveDrawing";
import { parseCSV } from "./parseCSV";
import { parseExcel } from "./parseExcel";
import { AppType, PDFData, extractPDFContent, pdfParser } from "./parsePDF";
import { parseXML } from "./parseXML";
import { getDocument, GlobalWorkerOptions, PDFPageProxy } from "pdfjs-dist";

import generateDevConfigurationSummaryContent from "@/app/generators/generateDevConfigurationSummaryContent";
import { VersionData } from "../versions/VersionData";
import { ModifiedDate, YourPDFType } from "./DocType";
import { parseDocx } from "./parseDocx";
import { AlignmentOptions } from "../state/redux/slices/toolbarSlice";
import { DocumentObject } from "../state/redux/slices/DocumentSlice";
import Version from "../versions/Version";
import { DocumentSize } from "../models/data/StatusType";
import { loadCalendarEventsDocumentContent, loadClientPortfolioDocumentContent, loadCryptoWatchDocumentContent, loadDiagramDocumentContent, loadDraftDocumentContent, loadDrawingDocumentContent, loadFinancialReportDocumentContent, loadGenericDocumentContent, loadMarkdownDocumentContent, loadMarketAnalysisDocumentContent, loadOtherDocumentContent, loadPDFDocumentContent, loadPresentationDocumentContent, loadSQLDocumentContent, loadSpreadsheetDocumentContent, loadTextDocumentContent } from "./DocumentGeneratorMethods";
import { FinancialReport } from "./documentation/report/Report";
import { BaseData } from "../models/data/Data";
import { Content } from "../models/content/AddContent";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";

var xl = require("excel4node");

const { handleError } = useErrorHandling();

interface CustomPDFPage extends PDFPage {
  getText(): Promise<string>;
  getTextContent(): Promise<string>;
}


interface CustomDocxtemplater<TZip> extends Docxtemplater<TZip>, DocumentData<T, K, Meta> {
  load(content: any): void;
}

type DocumentPath<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> = DocumentData<T, K, Meta> | DatasetModel<T, K, Meta>;
type CustomPDFProxyPage = CustomPDFPage & PDFPageProxy;

enum DocumentTypeEnum {
  Default = "default",
  Text = "text",
  Spreadsheet = "spreadsheet",
  Diagram = "diagram",
  CalendarEvents = "calendarEvents",
  Drawing = "drawing",
  Presentation = "presentation",
  CryptoWatch = "cryptowatch",
  Draft = "draft",
  Document = "document",
  Design = "Design",
  PDFDocument = "PDFDocument",
  MarkdownDocument = "MarkdownDocument",
  SQLDocument = "SQLDocument",
  Other = "other",
  FinancialReport = "financialReport",
  MarketAnalysis = "marketAnalysis",
  ClientPortfolio = "clientPortfolio",
  Template = "template",
  Image = "image",
  PDF = "pdf",
  APP_VERSION = "appVersion",
  File = "file",
  URL = "url",
}

enum DocumentStatusEnum {
  Draft = "draft",
  Finalized = "finalized",
  Archived = "archived",
  Deleted = "deleted",
}


const documents: DocumentData<any, any, any>[] = [
  {
    id: "1",
    _id: "1",
    title: "Sample Financial Report",
    content: {
      value: "Financial Report Content",
      id: "1",
      title: "Sample Financial Report",
      description: "This is a sample financial report",
      subscriberId: "subscriber123",
      category: "Finance",
      categoryProperties: categoryProperties,
      timestamp: new Date().toISOString(),
      length: 1500, // Example length in characters
      items: [], // Populate with items as necessary
      data: {}, // Populate with appropriate data as needed
    } as Content<any, any, StructuredMetadata<any, any>>, // Specify content structure
    documents: [],
    permissions: undefined,
    folders: [],
    folderPath: "/path/to/folder",
    previousContent: undefined,
    currentContent: undefined,
    previousMeta: {} as StructuredMetadata<T, K>,
    currentMeta: {} as StructuredMetadata<T, K>,
    accessHistory: [],
    documentPhase: undefined,
    version: undefined,
    versionData: undefined,
    visibility: "Public", // Example visibility
    documentSize: {
    // size: 1500
  }, // Example document size
    lastModifiedDate: {value: "", isModified: false } as ModifiedDate,
    lastModifiedBy: "User1",
    createdByRenamed: "User1",
    createdDate: new Date().toISOString(),
    documentType: "Financial Report",
    documentData: undefined,
    document: undefined,
    _rev: "1",
    _attachments: {},
    _links: {},
    _etag: "",
    _local: false,
    _revs: [],
    _source: {},
    _shards: {},
    _size: 1500,
    _version: 1,
    _version_conflicts: 0,
    _seq_no: 1,
    _primary_term: 1,
    _routing: "someRouting",
    _parent: "parent123",
    _parent_as_child: false,
    _slices: [],
    _highlight: {},
    _highlight_inner_hits: {},
    _source_as_doc: true,
    _source_includes: [],
    _routing_keys: [],
    _routing_values: [],
    _routing_values_as_array: [],
    _routing_values_as_array_of_objects: [],
    _routing_values_as_array_of_objects_with_key: [],
    _routing_values_as_array_of_objects_with_key_and_value: [],
    _routing_values_as_array_of_objects_with_key_and_value_and_value: [],
  },
  // Add more documents as necessary
];


class DocumentGenerator {
  createTextDocument(
    type: DocumentTypeEnum,
    options: DocumentOptions,
    fileContent: Buffer
  ): string {
    const content = options.content || "Default Text Document Content";
    const contentData = { content }; // Data to fill in the template
    const docx = new Docxtemplater() as CustomDocxtemplater<any>;
    docx.load(fileContent); // Load content directly instead of reading from file
    docx.setData(contentData);

    try {
      docx.render();
      const result = docx.getZip().generate({ type: "nodebuffer" });
      // Adjust this part according to your use case. For example, you can return the buffer or save it to a file.
      // Example of returning the buffer:
      // return result;
      return "Text Document created successfully.";
    } catch (error) {
      console.error("Error creating text document:", error);
      return "Error creating text document.";
    }
  }

  async createMarketAnalysis(
    type: DocumentTypeEnum,
    options: DocumentOptions,
    fileContent: Buffer
  ): Promise<string> {
    try {
      // Implement the logic to create a market analysis document
      const analysisContent =
        options.content || "Default Market Analysis Content";
      const analysisData = { content: analysisContent };

      // Assuming the use of a library similar to Docxtemplater for document creation
      const zip = new PizZip(fileContent);
      const docx = new Docxtemplater(zip);

      docx.setData(analysisData);

      docx.render();
      const result = await docx.getZip().generateAsync({ type: "nodebuffer" });

      return "Market Analysis created successfully.";
    } catch (error: any) {
      console.error("Error creating market analysis document:", error);
      return "Error creating market analysis document: " + error.message;
    }
  }

  async loadDocumentContent(
    draftId: string | undefined,
    document: DocumentObject<T, K, Meta>,
    newContent: CustomDocxtemplater<any>,
    dataCallback: (data: WritableDraft<DocumentObject>) => void,
    format: string,
    docx?: CustomDocxtemplater<any>,
    config?: DatabaseConfig,
    documentId?: number,
    formData?: FormData
  ): Promise<string | undefined> {
    if (config && draftId) {
      switch (document.type) {
        case DocumentTypeEnum.Text:
          // Logic to load content for a text document
          return loadTextDocumentContent(document);
        case DocumentTypeEnum.Spreadsheet:
          // Logic to load content for a spreadsheet document
          //   todo add document types
          return loadSpreadsheetDocumentContent(document);
        case DocumentTypeEnum.Diagram:
          // Logic to load content for a diagram document
          return await loadDiagramDocumentContent(
            Number(document),
            dataCallback
          );
        case DocumentTypeEnum.CalendarEvents:
          // Logic to load content for a calendar events document
          return loadCalendarEventsDocumentContent(Number(document));
        case DocumentTypeEnum.Drawing:
          // Logic to load content for a drawing document
          return loadDrawingDocumentContent(document);
        case DocumentTypeEnum.Presentation:
          // //   // Logic to load content for a presentation document
          return loadPresentationDocumentContent(document);
        case DocumentTypeEnum.CryptoWatch:
          // Logic to load content for a CryptoWatch document
          // Call userServices to fetch the user ID
          if (userId) {
            const user = await userService.fetchUserById(userId); // Adjust this according to your user services implementation
            return loadCryptoWatchDocumentContent(document, user);
          } else {
            throw new Error("User ID not provided");
          }
        // todo finish setting up doc types
        case DocumentTypeEnum.Draft:
          // Logic to load content for a draft document
          return loadDraftDocumentContent(config, draftId);
        case DocumentTypeEnum.Document:
          // Logic to load content for a generic document
          return loadGenericDocumentContent(document, format, dataCallback);
        case DocumentTypeEnum.Other:
          // Logic to load content for another type of document
          return loadOtherDocumentContent(
            Number(documentId),
            format,
            dataCallback 
          );
        case DocumentTypeEnum.FinancialReport:
          // Logic to load content for a financial report document
          return loadFinancialReportDocumentContent(Number(document.id), dataCallback);
        case DocumentTypeEnum.MarketAnalysis:
          // Logic to load content for a market analysis document
          return loadMarketAnalysisDocumentContent(document, dataCallback);
        case DocumentTypeEnum.ClientPortfolio:
          // Logic to load content for a client portfolio document
          return loadClientPortfolioDocumentContent(document, dataCallback);
        case DocumentTypeEnum.SQLDocument:
          // Logic to load content for an SQL document
          return loadSQLDocumentContent(document, dataCallback);
        case DocumentTypeEnum.PDFDocument:
          // Logic to load content for a PDF document
          return loadPDFDocumentContent(document, dataCallback);
        case DocumentTypeEnum.MarkdownDocument:
          // Logic to load content for a Markdown document
          return loadMarkdownDocumentContent(document, dataCallback);

        default:
          console.error(`Unsupported document type: ${document.type}`);
          return undefined; // Return undefined for unsupported document types
      }
    }
  }

  
async createCalendarEvents(options: DocumentOptions): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      // Placeholder logic for document generation
      const documentContent = "Calendar Events Document Content";

      // Simulate document generation process
      generateDocument(documentContent, options)
        .then((document) => {
          // Log successful document creation
          FileLogger.logDocument(
            "Calendar Events Document created successfully.",
            String(document.id),
            String(document.id)
          );
          
          // Return success message
          resolve("Calendar Events Document created successfully.");
        })
        .catch((error) => {
          // Handle errors
          const errorMessage = "Failed to create Calendar Events Document";
          handleError(errorMessage, { componentStack: error.stack });
          reject(errorMessage);
        });
    } catch (error: any) {
      // Handle synchronous errors
      const errorMessage = "Failed to create Calendar Events Document";
      handleError(errorMessage, { componentStack: error.stack });
      reject(errorMessage);
    }
  });
}
  // Define the function to save document content
  saveDocumentContent(
    document: DocumentPath<T, K, Meta>,
    content: string
  ): Promise<string> {
    try {
      // Save the loaded/generated content
      saveDocumentToDatabase(document as DatasetModel, content);

      // Optionally, you can perform additional actions here

      // Update last modified date
      document.lastModifiedDate = { value: new Date(), isModified: true } as ModifiedDate;

      // Return success message
      return Promise.resolve("Document content saved successfully.");
    } catch (error) {
      // Handle errors if saving fails
      console.error("Error saving document content:", error);
      // Optionally, you can throw the error or handle it in a different way
      return Promise.reject("Error saving document content");
    }
  }

  createSpreadsheet(options: DocumentOptions): string {
    // Real-world logic to create a spreadsheet using excel4node
    const wb = new xl.Workbook(); // Create a new Workbook instance
    const ws = wb.addWorksheet("Sheet 1"); // Add a worksheet

    // Set cell values based on options or provide default content
    const content = options.content || "Default Spreadsheet Content";
    ws.cell(1, 1).string(content);

    // Save the workbook
    wb.write("spreadsheet.xlsx");

    return "Spreadsheet created successfully.";
  }

  manageDocument(
    draftId: string,
    documentPath: DocumentPath<T, K, Meta>,
    newContent: CustomDocxtemplater<any>,
    dataCallback: (data: WritableDraft<DocumentObject>) => void,
    format: FormatEnum
  ): string {
    // Real-world logic to manage existing documents
    try {
      // Load the existing document content
      const existingContent = this.loadDocumentContent(
        draftId,
        documentPath,
        newContent,
        dataCallback,
        format
      );

      // Perform actions on the existing document content (e.g., append, modify, etc.)
      const updatedContent = `${existingContent}\nUpdated Content: ${newContent}`;

      // Save the updated content to the document
      this.saveDocumentContent(documentPath, updatedContent);

      return "Document managed successfully.";
    } catch (error) {
      console.error("Error managing document:", error);
      return "Error managing document.";
    }
  }

  exportDocument(
    documentId: string,
    documentPath: DocumentPath<T, K, Meta>,
    exportPath: CustomDocxtemplater<any>,
    format: FormatEnum,
    dataCallback: (data: WritableDraft<DocumentPath>) => void,
    docx?: CustomDocxtemplater<any> | undefined
  ): Promise<string> {
    // Real-world logic to export documents
    return new Promise<string>((resolve, reject) => {
      try {
        // Load the content of the document to export
        this.loadDocumentContent(
          documentId,
          documentPath as DocumentObject<T, K, Meta>,
          exportPath,
          dataCallback,
          format,
          docx
        )
          .then((fileContent: string | undefined) => {
            if (fileContent !== undefined) {
              // Save the content to the export path
              this.saveDocumentContent(exportPath, fileContent)
                .then(() => {
                  resolve("Document exported successfully.");
                })
                .catch((error) => {
                  reject(error);
                });
            } else {
              reject("Error loading document content.");
            }
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        console.error("Error exporting document:", error);
        reject(error);
      }
    });
  }

  createDrawing(options: DocumentOptions): string {
    const templatePath = path.join(
      __dirname,
      "templates",
      "drawingTemplate.svg"
    );
    const content = options.content || "Default Drawing Content";

    try {
      // Use the createDrawingUsingMock method to generate the drawing
      const drawing = this.createDrawingUsingMock(templatePath, content);
      // Perform any additional logic specific to the chosen drawing library

      // Autosave the drawing
      autosaveDrawing(drawing as unknown as WritableDraft<Tracker>[]);

      return drawing;
    } catch (error) {
      console.error("Error creating drawing:", error);
      throw error;
    }
  }

  private createDrawingUsingMock(
    templatePath: string,
    content: string
  ): string {
    // Example: Use a placeholder library for drawings
    const drawingLibrary: DrawingFunctions =
      require("./../../components/libraries/drawing/drawingLibraryMock").default; // Adjust the path to match the location of your drawingLibraryMock file

    // Assuming you have a specific function in your mock library to create a drawing
    const drawing = drawingLibrary.createDrawing(templatePath, content);
    const drawingOptions: DrawingOptions = {
      color: "black",
      size: 10,
      fillColor: "white",
      fill: true,
      strokeColor: "black",
      lineWidth: 2,
    };

    // Example usage of drawCircle function with templatePath and content parameters
    drawingLibrary.drawCircle(100, 100, 50, drawingOptions);

    // Log the drawing
    console.log("Created drawing:", drawing);

    // Return a placeholder value for demonstration
    return "Placeholder drawing created.";
  }

  createPresentation(options: DocumentOptions): string {
    const templatePath = path.join(
      __dirname,
      "templates",
      "presentationTemplate.pptx"
    );
    const content = options.content || "Default Presentation Content";

    // Example: Use a placeholder library for presentations
    const presentationLibrary = require("./../../components/libraries/presentations/presentationLibrary");

    const presentation = presentationLibrary.createPresentation(
      templatePath,
      content
    );

    try {
      // Perform any additional logic specific to the chosen presentation library
      // Save the presentation or perform other operations as needed

      return "Presentation created successfully.";
    } catch (error) {
      console.error("Error creating presentation:", error);
      return "Error creating presentation.";
    }
  }

  createFinancialReport(options: DocumentOptions): string {
    // Real-world logic to create a financial report
    // Use the provided FinancialReportWrapper or implement logic to handle financial reports

    // Example: Generating a financial report document
    const financialReportContent = "Financial Report Content";
    const financialReportFileName = "financial_report.docx"; // Example filename

    try {
      // Perform logic to generate the financial report document
      generateFinancialReportContent(options, documents);
      // For demonstration purposes, let's assume the document generation is successful
      // and write the content to a file
      fs.writeFileSync(financialReportFileName, financialReportContent);

      return "Financial Report created successfully.";
    } catch (error) {
      console.error("Error creating financial report:", error);
      return "Error creating financial report.";
    }
  }

  // Add methods for other document types (e.g., createPresentation, createDrawing, etc.)
  createDiagram(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        // Generate the diagram using the diagram generation library
        const diagram = generateDiagram();

        // Once the diagram is generated successfully, resolve the Promise with a success message
        resolve("Diagram created successfully.");
      } catch (error) {
        console.error("Error creating diagram:", error);
        // If there's an error during diagram generation, reject the Promise with an error message
        reject("Error creating diagram.");
      }
    });
  }
  createDocument(
    type: string,
    options: DocumentOptions,
    fileContent: Buffer
  ): string {
    switch (type) {
      case DocumentTypeEnum.Text:
        return this.createTextDocument(type, options, fileContent);
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

  createExecutiveSummary(options: DocumentOptions): string {
    // Logic to generate executive summary
    const executiveSummaryContent =
      generateDevConfigurationSummaryContent(options);
    // Write the executive summary content to a file
    fs.writeFileSync("executive_summary.docx", executiveSummaryContent);
    return "Executive summary created successfully.";
  }
  // Additional methods for document management, export, etc.
}

export default DocumentGenerator;
export { DocumentStatusEnum, DocumentTypeEnum, }
export type { CustomDocxtemplater, DocumentPath, CustomPDFProxyPage, CustomPDFPage, FinancialReport };