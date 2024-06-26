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

// // Add the namespace declaration for DXT if it's not already imported
// declare namespace DXT {import { fs } from 'fs';
import { DataVersions } from "@/app/configs/DataVersionsConfig";
import { UserSettings } from "@/app/configs/UserSettings";
import Version from "../versions/Version";
import {
  DocumentSize,
  Layout,
  ProjectPhaseTypeEnum,
} from "../models/data/StatusType";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import {
  CodingLanguageEnum,
  LanguageEnum,
} from "../communications/LanguageEnum";
import { pages } from "next/dist/build/templates/app-page";
import { sanitizeData, sanitizeInput } from "../security/SanitizationFunctions";
import { DocumentObject } from "../state/redux/slices/DocumentSlice";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import { extractTextFromPage } from "./CustomPDFPage";
import { Phase } from "../phases/Phase";


function loadTextDocumentContent(document: DocumentData): string  {
  let textContent = '';

  // Check if content exists in local storage
  if (localStorage.getItem(`document_${document.id}`)) {
    textContent = localStorage.getItem(`document_${document.id}`) || '';
    console.log('Content loaded from local storage:', textContent);
  } else {
    // Example: If content is not directly stored but needs fetching
    if (document.source === 'database') {
      textContent = fetchTextContentFromDatabase(Number(document.id));
      console.log('Content loaded from database:', textContent);
    } else if (document.source === 'cloud') {
      textContent = downloadTextContentFromCloud(String(document.url));
      console.log('Content downloaded from cloud:', textContent);
    } else {
      console.warn('No document content found.');
      textContent = 'No document content found.';
    }

    // Store content in local storage for future use
    localStorage.setItem(`document_${document.id}`, textContent);
  }

  // Return the loaded text content
  return textContent;
}

// Example of a function to fetch text content from a database
function fetchTextContentFromDatabase(documentId: number): string {
  // Replace with actual database fetching logic
  return `Text content from database for document ${documentId}`;
}

// Example of a function to download text content from cloud storage
function downloadTextContentFromCloud(url: string): string {
  // Replace with actual cloud storage download logic
  return `Downloaded text content from ${url}`;
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

async function loadFinancialReportDocumentContent(
  documentId: number,
  dataCallback: (data: WritableDraft<DocumentObject>) => void
): Promise<string> {
  try {
    // Fetch the document data using the document ID
    const document = await fetchDocumentByIdAPI(documentId, dataCallback);

    // Check if the document type is FinancialReport
    if (document.type !== DocumentTypeEnum.FinancialReport) {
      throw new Error("Document is not of type FinancialReport");
    }

    // Extract the financial report content
    const financialReportContent =
      document.documentData.financialReport?.financialReportContent;

    // Check if financial report content is available
    if (!financialReportContent) {
      throw new Error("No financial report content available");
    }

    // Return the financial report content as a string
    return financialReportContent;
  } catch (error) {
    console.error("Error loading financial report document content:", error);
    // Handle error appropriately
    throw error;
  }
}


async function loadMarketAnalysisDocumentContent(
  document: DocumentData,
  dataCallback: (data: WritableDraft<DocumentObject>) => void
): Promise<string> {
  try {
    // Logic to load content for a market analysis document
    // This could involve fetching data from a database, API, or file system
    // For demonstration purposes, let's assume the content is stored in the document's `content` property
    const marketAnalysisContent = document.content;

    // Return the loaded content
    return marketAnalysisContent;
  } catch (error) {
    console.error("Error loading market analysis document content:", error);
    // Handle error appropriately
    throw error;
  }
}

async function loadClientPortfolioDocumentContent(
  document: DocumentData,
  dataCallback: (data: WritableDraft<DocumentObject>) => void
): Promise<string> {
  try {
    // Logic to load content for a client portfolio document
    // This could involve fetching data from a database, API, or file system
    // For demonstration purposes, let's assume the content is stored in the document's `content` property
    const clientPortfolioContent = document.content;

    // Return the loaded content
    return clientPortfolioContent;
  } catch (error) {
    console.error("Error loading client portfolio document content:", error);
    // Handle error appropriately
    throw error;
  }
}

async function loadSQLDocumentContent(
  document: DocumentPath,
  dataCallback: (data: WritableDraft<DocumentObject>) => void
): Promise<string> {
  try {
    // Assuming the SQL script is stored in the document's content property
    if ("content" in document) {
      // Access the content property safely
      const sqlScript = document.content;

      // Wrap sqlScript in a WritableDraft<DocumentData> object
      const draft: WritableDraft<DocumentObject> = {
        id: 0,
        title: "draft title",
        content: sqlScript,
        permissions: undefined,
        timestamp: new Date(),
        category: "Document Category",
        folders: [],
        options: undefined,
        folderPath: "Folder Path",
        previousMetadata: undefined,
        currentMetadata: undefined,
        accessHistory: [],
        lastModifiedDate: {
          value: new Date(),
          isModified: false,
        } as ModifiedDate,
        versionData: undefined,
        version: null,
        visibility: "public",
        _id: "",
        documentSize: DocumentSize.A4,
        lastModifiedBy: "",
        name: "",
        description: "",
        createdBy: "",
        createdDate: undefined,
        documentType: "",
        filePathOrUrl: "",
        uploadedBy: 0,
        uploadedAt: "",
        tagsOrCategories: "",
        format: "",
        uploadedByTeamId: null,
        uploadedByTeam: null,
        URL: "",
        alinkColor: "",
        // all: undefined,
        // anchors: undefined,
        // applets: undefined,
        bgColor: "",
        // body: undefined,
        characterSet: "",
        charset: "",
        compatMode: "",
        contentType: "",
        cookie: "",
        currentScript: null,
        defaultView: null,
        designMode: "",
        dir: "",
        doctype: null,
        // documentElement: undefined,
        documentURI: "",
        domain: "",
        // embeds: undefined,
        fgColor: "",
        // forms: undefined,
        fullscreen: false,
        fullscreenEnabled: false,
        // head: undefined,
        hidden: false,
        // images: undefined,
        // implementation: undefined,
        inputEncoding: "",
        lastModified: "",
        linkColor: "",
        // links: undefined,
        // location: undefined,
        onfullscreenchange: null,
        onfullscreenerror: null,
        onpointerlockchange: null,
        onpointerlockerror: null,
        onreadystatechange: null,
        onvisibilitychange: null,
        ownerDocument: null,
        pictureInPictureEnabled: false,
        // plugins: undefined,
        readyState: "loading",
        referrer: "",
        rootElement: null,
        // scripts: undefined,
        scrollingElement: null,
        timeline: undefined,
        visibilityState: "hidden",
        vlinkColor: "",
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
      }
      // Notify any data listeners about the loaded content
      dataCallback(draft);

      // Return the loaded SQL script
      return sqlScript;
    } else {
      throw new Error("Invalid document type");
    }
  } catch (error) {
    console.error("Error loading SQL document content:", error);
    throw error;
  }
}

async function loadPDFDocumentContent(
  document: DocumentData,
  dataCallback: (data: WritableDraft<DocumentObject>) => void
): Promise<string> {
  try {
    const pdfBytes =
      typeof document.content === "string"
        ? Uint8Array.from(atob(document.content), (c) => c.charCodeAt(0))
        : document.content;

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdfDocProxy = await getDocument({ data: pdfBytes }).promise;

    let text = "";

    const numPages = pdfDoc.getPageCount();
    for (let i = 0; i < numPages; i++) {
      const page = await pdfDocProxy.getPage(i + 1);
      const pageText = await extractTextFromPage(page as CustomPDFProxyPage);
      text += pageText;
    }

    const updatedDocument = { ...document, content: text };
    dataCallback(updatedDocument as WritableDraft<DocumentObject>);

    return text;
  } catch (error) {
    console.error("Error loading PDF document content:", error);
    throw error;
  }
}

async function loadMarkdownDocumentContent(
  document: DocumentPath,
  dataCallback: (data: WritableDraft<DocumentObject>) => void
): Promise<string> {
  try {
    // Assuming the Markdown file path is stored in the document's filePathOrUrl property
    const filePath = document.filePathOrUrl;

    // Read the Markdown file
    const markdownContent = await fs.promises.readFile(filePath, "utf-8");

    // Call dataCallback with the modified document
    const updatedDocument = { ...document, content: markdownContent };
    dataCallback(updatedDocument as WritableDraft<DocumentObject>);

    // Return the Markdown content
    return markdownContent;
  } catch (error) {
    console.error("Error loading Markdown document content:", error);
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
  presentationId: DocumentObject
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

async function loadDraftDocumentContent(
  config: DatabaseConfig,
  draftId: string
): Promise<string> {
  try {
    // Logic to load draft document content
    const draft = await loadDraftFromDatabase(config, draftId);

    // Generate JSON from draft object
    const draftJSON = generateDraftJSON(draft);

    // Return draft JSON as string
    return JSON.stringify(draftJSON);
  } catch (error) {
    console.error("Error loading draft document content:", error);
    // handle error appropriately
    return "";
  }
}

async function loadGenericDocumentContent(
  documentId: DocumentObject,
  format: string,
  dataCallback: (data: WritableDraft<DocumentObject>) => void
): Promise<string> {
  let parsedContent: any;

  try {
    // Logic to fetch document data
    const document = await fetchDocumentByIdAPI(
      Number(documentId),
      dataCallback
    );

    // Validate format
    const allowedFormats = ["pdf", "docx", "xlsx"]; // Define allowedFormats array
    if (!allowedFormats.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error: any) {
    console.error("Error parsing document content", error);
    throw error;
  }
  return JSON.stringify(parsedContent);
}

// Update the extractTextFromPDF function to use CustomPDFPage instead of PDFPage
async function extractTextFromPDF(
  pdfString: string | Uint8Array
): Promise<string> {
  try {
    // Load the PDF from the provided string or Uint8Array
    const pdfBytes =
      typeof pdfString === "string"
        ? Uint8Array.from(atob(pdfString), (c) => c.charCodeAt(0))
        : pdfString;
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Extract text from each page of the PDF
    let text = "";
    const numPages = pdfDoc.getPageCount();
    for (let i = 0; i < numPages; i++) {
      const page = (await pdfDoc.getPage(i)) as CustomPDFPage; // Cast to CustomPDFPage
      const pageText = await page.getText();
      text += pageText;
    }

    return text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

async function parsePDFToText(pdfFilePath: string): Promise<PDFData> {
  try {
    const pdfContent = await pdfParser(pdfFilePath);
    const parsedData: PDFData = { pdfContent };
    return parsedData;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw error;
  }
}

function loadPDFFile(pdfFilePath: string): YourPDFType[] {
  const sanitizedPath = sanitizeInput(pdfFilePath);
  const pdfData: YourPDFType[] = [];

  const pdfText = parsePDFToText(sanitizedPath);

  pdfData.push({
    text: pdfText,
    pageNumber: 0,
    textContent: "",
    parsedData: [],
  });

  return pdfData;
}

function loadPDF(pdfFilePath: string): YourPDFType[] {
  const pdf = loadPDFFile(pdfFilePath);
  return pdf;
}

function parsePDFData<T extends object>({
  pdfDataType,
  parsedData,
  appType,
}: {
  pdfDataType: YourPDFType[];
  parsedData: ParsedData<T>[];
  appType?: AppType;
}): void {
  pdfDataType.forEach((pdf: YourPDFType) => {
    const pdfContent: string = extractPDFContent(pdf);

    const correspondingParsedData = parsedData.find((data) => {
      return data.pageNumber === pdf.pageNumber;
    });

    if (correspondingParsedData) {
      correspondingParsedData.pdfContent = pdfContent;
    }
  });
}

async function loadDocumentContentFromDatabase(
  pdfType: YourPDFType,
  [],
  pdfData: string | Uint8Array,
  pdfFilePath: string,
  parsedData: ParsedData<PDFData>[],
  pdfDataType: YourPDFType[],
  appType: AppType,
  documentId: number,
  format: string,
  dataCallback: (data: WritableDraft<DocumentData>) => void
): Promise<string> {
  let parsedContent: any;

  try {
    // Logic to fetch document data
    const document = await fetchDocumentByIdAPI(documentId, dataCallback);

    // Validate format
    const allowedFormats = [
      "pdf",
      "docx",
      "xlsx",
      "json",
      "txt",
      "csv",
      "md",
      "html",
      "jpeg",
      "png",
      "gif",
      "mp3",
      "wav",
      "mp4",
      "avi",
      "xml",
      "yaml",
      "pptx",
      "dwg",
      "dxf",
      "shp",
      "geojson",
      "sql",
    ];

    if (!allowedFormats.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }
    // Logic to parse document content based on format
    switch (format) {
      case "pdf":
        parsedContent = await extractTextFromPDF(pdfData);
        break;
      case "docx":
        const docxFilePath = document.filePath;
        parsedContent = parseDocx(docxFilePath, parsedData);
        break;
      case "xlsx":
        parsedContent = parseExcel(document.content);
        break;
      case "json":
        parsedContent = JSON.parse(document.content);
      // Add support for additional formats here
      // TODO: Add support for TXT, CSV, Markdown, HTML, Image formats, Audio formats, Video formats,
      // Binary data, JSON, XML, YAML, DOCX, XLSX, PPTX, CAD files, GIS files, Database dump files
      case "txt":
        // Logic to parse plain text content
        parsedContent = document.content;
        break;
      case "csv":
        // Logic to parse CSV content
        const csvContent = Papa.parse(document.content, { header: true });
        break;
      case "md":
        // Logic to parse Markdown content
        break;
      case "html":
        // Logic to parse HTML content
        break;
      case "jpeg":
      case "png":
      case "gif":
        // Logic to parse image content
        break;
      case "mp3":
      case "wav":
        // Logic to parse audio content
        break;
      case "mp4":
      // Logic to parse video content
      case "avi":
        // Logic to parse video content
        break;
      case "json":
        // Logic to parse JSON content
        break;
      case "xml":
        // Logic to parse XML content
        break;
      case "yaml":
        // Logic to parse YAML content
        break;
      case "pptx":
        // Logic to parse PowerPoint content
        break;
      case "dwg":
      case "dxf":
        // Logic to parse CAD file content
        break;
      case "shp":
      case "geojson":
        // Logic to parse GIS file content
        break;
      case "sql":
        // Logic to parse SQL dump file content
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error("Error parsing document content", error);
    throw error;
  }
  return "";
}

async function loadOtherDocumentContent(
  this: any,
  documentId: number,
  format: string,
  dataCallback: (data: WritableDraft<DocumentOptions>) => void
): Promise<string> {
  try {
    // Logic to load other document content
    const document = await fetchDocumentByIdAPI(
      Number(documentId),
      dataCallback
    );
    const pdfFilePath = document.filePath;
    const pdfDataType = document.type;
    const parsedData = document.parsedData;
    const appType = document.appType;

    const pdfData = document.content;
    const pdfType = document.type;
    const documentContent = await loadDocumentContentFromDatabase(
      pdfType,
      pdfData,
      pdfData,
      pdfFilePath,
      parsedData,
      pdfDataType,
      appType,
      documentId,
      format,
      dataCallback
    );

    // Return document content
    return documentContent;
  } catch (error) {
    console.error("Error loading other document content:", error);
  } finally {
    // Ensure dataCallback is called even if error occurs
    const defaultOptions = getDefaultDocumentOptions(); // Get default options
    const updatedOptions: Partial<DocumentOptions> = {
      levels: { ...defaultOptions.levels } // Use default levels structure
    };

    dataCallback({
      options: updatedOptions as WritableDraft<DocumentOptions>,
      id: "",
      _id: "",
      title: "",
      content: "",
      permissions: undefined,
      folders: [],
      folderPath: "",
      previousMetadata: undefined,
      currentMetadata: undefined,
      accessHistory: [],
      versionData: undefined,
      version: undefined,
      visibility: undefined,
      documentSize: DocumentSize.A4,
      lastModifiedDate: undefined,
      lastModifiedBy: "",
      name: "",
      description: "",
      createdBy: "",
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
      URL: "",
      alinkColor: "",
      // all: undefined,
      // anchors: undefined,
      // applets: undefined,
      bgColor: "",
      // body: undefined,
      characterSet: "",
      charset: "",
      compatMode: "",
      contentType: "",
      cookie: "",
      currentScript: null,
      defaultView: null,
      designMode: "",
      dir: "",
      doctype: null,
      // documentElement: undefined,
      documentURI: "",
      domain: "",
      // embeds: undefined,
      fgColor: "",
      // forms: undefined,
      fullscreen: false,
      fullscreenEnabled: false,
      // head: undefined,
      hidden: false,
      // images: undefined,
      // implementation: undefined,
      inputEncoding: "",
      lastModified: "",
      linkColor: "",
      // links: undefined,
      // location: undefined,
      onfullscreenchange: null,
      onfullscreenerror: null,
      onpointerlockchange: null,
      onpointerlockerror: null,
      onreadystatechange: null,
      onvisibilitychange: null,
      ownerDocument: null,
      pictureInPictureEnabled: false,
      // plugins: undefined,
      readyState: "loading",
      referrer: "",
      rootElement: null,
      // scripts: undefined,
      scrollingElement: null,
      // timeline: undefined,
      visibilityState: "hidden",
      vlinkColor: "",
      
      documents: [],
      selectedDocument: null,
      filteredDocuments: [],
      searchResults: [],
      loading: false,
      error: null
    });

    return "documentContent";
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
  document: DocumentObject,
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

// // Define the allowed diagram formats
//   const allowedDiagramFormats = [
//     "json",
//     "xml",
//     "csv",
//     "xls",
//     "xlsx"
//   ]; // Updated list of allowed diagram formats

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
export { DocumentStatusEnum, DocumentTypeEnum, extractTextFromPDF };
export type { CustomDocxtemplater, DocumentPath };
