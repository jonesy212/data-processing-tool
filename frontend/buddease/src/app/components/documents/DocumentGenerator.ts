// DocumentGenerator.ts
import calendarApiService from "@/app/api/ApiCalendar";
import {
  fetchDocumentByIdAPI,
  generateDocument,
  loadPresentationFromDatabase,
} from "@/app/api/ApiDocument";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import {
  loadDrawingFromDatabase,
  saveDocumentToDatabase,
} from "@/app/configs/database/updateDocumentInDatabase";
import { generateDiagram } from "@/app/generators/diagramGenerationLibrary";
import { } from "@faker-js/faker";
import Docxtemplater from "docxtemplater";
import { DrawingFunctions, DrawingOptions } from "drawingLibrary";
import fs from "fs";
import * as path from "path";
import {
  loadCryptoWatchlistFromDatabase
} from "../crypto/CryptoWatchlist";
import { generateCryptoWatchlistJSON } from "../crypto/generateCryptoWatchlistJSON";
import useErrorHandling from "../hooks/useErrorHandling";
import { generatePresentationJSON } from "../libraries/presentations/generatePresentationJSON";
import { FileLogger } from "../logging/Logger";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { Document } from "../state/stores/DocumentStore";
import { DatasetModel } from "../todos/tasks/DataSetModel";
import userService, { userId } from "../users/ApiUser";
import { DocumentData } from "./DocumentBuilder";
import { DocumentOptions, getDefaultDocumentOptions } from "./DocumentOptions";
import generateFinancialReportContent from "./documentation/report/generateFinancialReportContent";
import { autosaveDrawing } from "./editing/autosaveDrawing";
import { parseCSV } from "./parseCSV";
import { parseExcel } from "./parseExcel";
import { parseXML } from "./parseXML";
var xl = require("excel4node");

const { handleError } = useErrorHandling();
interface CustomDocxtemplater<TZip> extends Docxtemplater<TZip>, DocumentData {
  load(content: any): void;
}
type DocumentPath = DocumentData | DatasetModel;

enum DocumentTypeEnum {
  Text = "text",
  Spreadsheet = "spreadsheet",
  Diagram = "diagram",
  CalendarEvents = "calendarEvents",
  Drawing = "drawing",
  Presentation = "presentation",
  CryptoWatch = "cryptowatch",
  Draft = "draft",
  Document = "document",
  Other = "other",
  FinancialReport = "financialReport",
  MarketAnalysis = "marketAnalysis",
  ClientPortfolio = "clientPortfolio",
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
    options: getDefaultDocumentOptions(),
    load: function (content: any): void {
      this.documentData = content;
    },
    lastModifiedDate: new Date(),
    version: {} as VersionData,
  },
  // Add more documents as needed
];

// // Add the namespace declaration for DXT if it's not already imported
// declare namespace DXT {import { fs } from 'fs';

//   // todo
//   // Define your types here...
// }

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

async function loadDiagramDocumentContent(
  documentId: number,
  dataCallback: (data: WritableDraft<DocumentData>) => void
): Promise<string> {
  // Adjust the return type to match expected type
  let parsedContent: any; // Declare parsedContent variable here

  try {
    // Fetch the document data
    const document = await fetchDocumentByIdAPI(documentId, dataCallback);

    // Validate the document format
    const format = document.format.toLowerCase();
    if (!allowedDiagramFormats.includes(format)) {
      throw new Error(`Unsupported diagram format: ${format}`);
    }

    // Logic to load diagram content based on the format
    switch (format) {
      case "json":
        parsedContent = JSON.parse(document.content);
        break;
      case "xml":
        parsedContent = parseXML(document.content);
        break;
      case "csv":
        parsedContent = parseCSV(document.content);
        break;
      case "xls":
      case "xlsx":
        parsedContent = await parseExcel(document.content);
        break;
      default:
        throw new Error(`Unsupported diagram format: ${format}`);
    }

    // Return parsed content as a string
    return JSON.stringify(parsedContent);
  } catch (error) {
    console.error("Error loading diagram document content:", error);
    // Handle error
    throw error;
  }
}

async function loadCalendarEventsDocumentContent(documentId: number) {
  // Logic to load content for a calendar events document
  const calendarEvents =
    await calendarApiService.fetchCalendarEventsFromDatabase(documentId);

  return JSON.stringify(calendarEvents);
}

// Function to load content for a drawing document
async function loadDrawingDocumentContent(
  documentId: DocumentData
): Promise<string> {
  try {
    // Logic to load content for a drawing document
    const drawing = await loadDrawingFromDatabase(documentId);
    // Generate JSON from drawing object
    const drawingJSON = generateDrawingJSON(drawing as Drawing);
    // Return drawing JSON as string
    return JSON.stringify(drawingJSON);
  } catch (error) {
    console.error("Error loading drawing document content:", error);
    // Handle error appropriately
    return ""; // Return empty string in case of error
  }
}

async function loadPresentationDocumentContent(
  presentationId: DocumentData
): Promise<string> {
  try {
    // Logic to load presentation content
    const presentation = await loadPresentationFromDatabase(presentationId);

    // Generate JSON from presentation object
    const presentationJSON = generatePresentationJSON(presentation);
    // Return presentation JSON as string
    return JSON.stringify(presentationJSON);
  } catch (error) {
    console.error("Error loading presentation document content:", error);
    // Handle error appropriately
    return "";
  }
}

async function loadCryptoWatchDocumentContent(
  documentId: DocumentData,
  userId: string
): Promise<string> {
  try {
    // Logic to load content for a crypto watchlist document

    const cryptoWatchlist = await loadCryptoWatchlistFromDatabase(
      documentId,
      userId
    );
    // Generate JSON from crypto watchlist object
    if (cryptoWatchlist) {
      const cryptoWatchlistJSON = generateCryptoWatchlistJSON(cryptoWatchlist);
      // Return crypto watchlist JSON as string
      return JSON.stringify(cryptoWatchlistJSON);
    } else {
      throw new Error("Crypto watchlist not found");
    }
  } catch (error) {
    console.error("Error loading crypto watchlist document content:", error);
    return "";
  }
}

// Update the return type in loadDocumentContent to handle Promise
async function loadDocumentContent(
  documentId: number,
  document: DocumentPath,
  dataCallback: (data: WritableDraft<DocumentData>) => void,
  docx: CustomDocxtemplater<any>
): Promise<string | undefined> {
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
      return await loadDiagramDocumentContent(documentId, dataCallback); // Handle Promise here
    case DocumentTypeEnum.CalendarEvents:
      //   // Logic to load content for a calendar events document
      return loadCalendarEventsDocumentContent(Number(document));
  }

  console.error(`Unsupported document type: ${document.type}`);
  return undefined; // Return undefined for unsupported document types
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

// Define the allowed diagram formats
const allowedDiagramFormats = ["json", "xml", "csv", "xls", "xlsx"]; // Updated list of allowed diagram formats

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

  async loadDocumentContent(
    documentId: number,
    document: DocumentPath,
    dataCallback: (data: WritableDraft<DocumentPath>) => void,
    docx?: CustomDocxtemplater<any>
  ): Promise<string | undefined> {
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
        return await loadDiagramDocumentContent(documentId, dataCallback);
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

        if(userId){
        const user = await userService.fetchUserById(userId); // Adjust this according to your user services implementation
        return loadCryptoWatchDocumentContent(document, user);
        }
        else {
          throw new Error("User ID not provided");
        }
      // todo finish setting up doc types
      // case DocumentTypeEnum.Draft:
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

  async createCalendarEvents(options: DocumentOptions): Promise<string> {
    try {
      // Placeholder logic for document generation
      const documentContent = "Calendar Events Document Content";

      // Simulate document generation process
      const document = await generateDocument(documentContent, options);

      // Log successful document creation
      FileLogger.logDocument(
        "Calendar Events Document created successfully.",
        String(document.id),
        String(document.id)
      );

      // Return success message
      return "Calendar Events Document created successfully.";
    } catch (error: any) {
      // Handle errors
      const errorMessage = "Failed to create Calendar Events Document";
      handleError(errorMessage, { componentStack: error.stack });
      return errorMessage;
    }
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
      document.lastModifiedDate = new Date();

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
    documentPath: DocumentPath,
    newContent: CustomDocxtemplater<any>,
    dataCallback: (data: WritableDraft<DocumentPath>) => void
  ): string {
    // Real-world logic to manage existing documents
    try {
      // Load the existing document content
      const existingContent = this.loadDocumentContent(
        Number(documentPath),
        newContent,
        dataCallback
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
    documentId: number,
    documentPath: DocumentPath,
    exportPath: DocumentPath,
    dataCallback: (data: WritableDraft<DocumentPath>) => void,
    docx?: CustomDocxtemplater<any> | undefined
  ): Promise<string> {
    // Real-world logic to export documents
    return new Promise<string>((resolve, reject) => {
      try {
        // Load the content of the document to export
        this.loadDocumentContent(documentId, documentPath, dataCallback, docx)
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
      autosaveDrawing(drawing); // Assuming autosaveDrawing takes care of saving the drawing

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
  // Additional methods for document management, export, etc.
}

export default DocumentGenerator;
export { DocumentStatusEnum, DocumentTypeEnum };
export type { DocumentPath };

