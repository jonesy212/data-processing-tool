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
import { Tracker } from "../models/tracker/Tracker";
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

var xl = require("excel4node");

const { handleError } = useErrorHandling();

interface CustomPDFPage extends PDFPage {
  getText(): Promise<string>;
  getTextContent(): Promise<string>;
}
interface CustomDocxtemplater<TZip> extends Docxtemplater<TZip>, DocumentData {
  load(content: any): void;
}

type DocumentPath = DocumentData | DatasetModel;
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

const documents: Document[] = [
  {
    id: 1,
    title: "Financial Report",
    type: DocumentTypeEnum.FinancialReport,
    status: DocumentStatusEnum.Draft,
    description: "Financial Report Description",
    content: "Financial Report Content",
    createdAt: "2021-07-01T00:00:00.000Z",
    updatedAt: "2021-07-01T00:00:00.000Z",
    createdBy: "John Doe",
    updatedBy: "John Doe",

    folderPath: "documents/financial-reports",
    previousMetadata: {} as StructuredMetadata,
    currentMetadata: {} as StructuredMetadata,
    accessHistory: [],
    documentData: {
      financialReport: {
        financialReportContent: "Financial Report Content",
        financialReportFileName: "financial_report.docx",
      },
    },
    tags: ["financial", "report", "2021"],
    topics: ["goals", "executive summary", "financial report"],
    highlights: ["goals", "objectives"],
    keywords: [],
    files: [],
    folders: [],
    options: getDefaultDocumentOptions(),
    load: function (content: any): void {
      this.documentData = content;
    },
    lastModifiedDate: { value: new Date(), isModified: false } as ModifiedDate, // Initialize as not modified
    version: {} as Version,
    permissions: {} as DocumentPermissions,
    versionData: {} as VersionData,
    visibility: undefined,
    completed: false,
    _id: "",
    documentSize: DocumentSize.A4,
    lastModifiedBy: "",
    name: "",
    createdDate: undefined,
    documentType: "",
    _rev: "",
    _attachments: undefined,
    _links: undefined,
    _etag: "",
    _local: false,
    _revs: [],
    _source: undefined,
    _shards: undefined,
    _size: 0,
    _version: 0,
    _version_conflicts: 0,
    _seq_no: 0,
    _primary_term: 0,
    _routing: "",
    _parent: "",
    _parent_as_child: false,
    _slices: [],
    _highlight: undefined,
    _highlight_inner_hits: undefined,
    _source_as_doc: false,
    _source_includes: [],
    _routing_keys: [],
    _routing_values: [],
    _routing_values_as_array: [],
    _routing_values_as_array_of_objects: [],
    _routing_values_as_array_of_objects_with_key: [],
    _routing_values_as_array_of_objects_with_key_and_value: [],
    _routing_values_as_array_of_objects_with_key_and_value_and_value: [],
    filePathOrUrl: "",
    uploadedBy: 0,
    uploadedAt: "",
    tagsOrCategories: "",
    format: "",
    uploadedByTeamId: null,
    uploadedByTeam: null,
  },
  // Add more documents as needed
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
    document: DocumentObject,
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
    document: DocumentPath,
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
    documentPath: DocumentObject,
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
    documentPath: DocumentPath,
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
          documentPath as DocumentObject,
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
export type { CustomDocxtemplater, DocumentPath, CustomPDFProxyPage, CustomPDFPage };