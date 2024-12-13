// DocumentGeneratorMethods.t
// // Add the namespace declaration for DXT if it's not already imported
// declare namespace DXT {import { fs } from 'fs';
import calendarApiService from "@/app/api/ApiCalendar";
import {
    fetchDocumentByIdAPI,
    getDocument,
    loadPresentationFromDatabase,
} from "@/app/api/ApiDocument";
import { BaseData } from '@/app/components/models/data/Data';
import { DatabaseConfig } from "@/app/configs/DatabaseConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { loadDrawingFromDatabase } from "@/app/configs/database/updateDocumentInDatabase";
import generateDraftJSON from "@/app/generators/generateDraftJSON";
import fs from "fs";
import Papa from "papaparse";
import { PDFDocument } from "pdf-lib";
import { AppType } from "vite";
import { loadCryptoWatchlistFromDatabase } from "../crypto/CryptoWatchlist";
import { generateCryptoWatchlistJSON } from "../crypto/generateCryptoWatchlistJSON";
import { fetchTextContentFromDatabase } from "../database/DataBaseMethods";
import loadDraftFromDatabase from "../database/loadDraftFromDatabase";
import { allowedDiagramFormats } from "../form/FormatEnum";
import {
    Drawing,
    generateDrawingJSON,
} from "../libraries/drawing/generateDrawingJSON";
import { generatePresentationJSON } from "../libraries/presentations/generatePresentationJSON";
import {
    DocumentSize
} from "../models/data/StatusType";
import { sanitizeInput } from "../security/SanitizationFunctions";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { DocumentObject } from "../state/redux/slices/DocumentSlice";
import { extractTextFromPage } from "./CustomPDFPage";
import { ModifiedDate, ParsedData, YourPDFType } from "./DocType";
import { DocumentData } from "./DocumentBuilder";
import {
    CustomDocxtemplater,
    CustomPDFPage,
    CustomPDFProxyPage,
    DocumentPath,
    DocumentTypeEnum,
} from "./DocumentGenerator";
import { DocumentOptions, getDefaultDocumentOptions } from "./DocumentOptions";
import { parseCSV } from "./parseCSV";
import { parseDocx } from "./parseDocx";
import { parseExcel } from "./parseExcel";
import { extractPDFContent, PDFData, pdfParser } from "./parsePDF";
import { parseXML } from "./parseXML";

var xl = require("excel4node");

async function loadTextDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(document: DocumentData<T, K>): Promise<string> {
  let textContent = "";

  // Check if content exists in local storage
  if (localStorage.getItem(`document_${document.id}`)) {
    textContent = localStorage.getItem(`document_${document.id}`) || "";
    console.log("Content loaded from local storage:", textContent);
  } else {
    // Example: If content is not directly stored but needs fetching
    if (document.source === "database") {
      textContent = await fetchTextContentFromDatabase(Number(document.id));
      console.log("Content loaded from database:", textContent);
    } else if (document.source === "cloud") {
      textContent = downloadTextContentFromCloud(String(document.url));
      console.log("Content downloaded from cloud:", textContent);
    } else {
      console.warn("No document content found.");
      textContent = "No document content found.";
    }

    // Store content in local storage for future use
    localStorage.setItem(`document_${document.id}`, textContent);
  }

  // Return the loaded text content
  return textContent;
}

// Example of a function to fetch text content from a database

// Example of a function to download text content from cloud storage
function downloadTextContentFromCloud(url: string): string {
  // Replace with actual cloud storage download logic
  return `Downloaded text content from ${url}`;
}

async function loadDiagramDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  documentId: number,
  dataCallback: (data: WritableDraft<DocumentObject<T, K, Meta>>) => void
): Promise<string> {
  try {
    // Fetch the document data
    const document = await fetchDocumentByIdAPI(documentId, dataCallback).then(
      (document: DocumentData<T, K>) => document
    )

    // Validate the document format
    const format = document.format.toLowerCase();
    if (!allowedDiagramFormats.includes(format)) {
      throw new Error(`Unsupported diagram format: ${format}`);
    }

    // Logic to load diagram content based on the format
    let parsedContent: any;
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

        parsedContent = await parseExcel(document.content.toString());
        break;
      default:
        throw new Error(`Unsupported diagram format: ${format}`);
    }

    // Return parsed content as a string
    return JSON.stringify(parsedContent);
  } catch (error) {
    console.error("Error loading diagram document content:", error);
    throw error;
  }
}

async function loadFinancialReportDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  documentId: number,
  dataCallback: (data: WritableDraft<DocumentObject<T, K>>) => void
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

async function loadMarketAnalysisDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  document: DocumentData<T, K>,
  dataCallback: (data: WritableDraft<DocumentObject<T, K>>) => void
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

async function loadClientPortfolioDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  document: DocumentData<T, K>,
  dataCallback: (data: WritableDraft<DocumentObject<T, K>>) => void
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

async function loadSQLDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  document: DocumentPath,
  dataCallback: (data: WritableDraft<DocumentObject<T, K>>) => void
): Promise<string> {
  try {
    // Assuming the SQL script is stored in the document's content property
    if ("content" in document) {
      // Access the content property safely
      const sqlScript = document.content;

      // Wrap sqlScript in a WritableDraft<DocumentData> object
      const draft: WritableDraft<DocumentObject<T, K>> = {
        id: 0,
        title: "draft title",
        content: sqlScript,
        permissions: undefined,
        timestamp: new Date(),
        category: "Document Category",
        folders: [],
        filePath: undefined,
        folderPath: "Folder Path",
        options: undefined,
        documentData: undefined,
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
        all: undefined,
        anchors: undefined,
        applets: undefined,
        // bgColor: "",
        body: undefined,
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
        documentElement: undefined,
        documentURI: "",
        domain: "",
        embeds: undefined,
        forms: undefined,
        fullscreen: false,
        fullscreenEnabled: false,
        head: undefined,
        hidden: false,
        images: undefined,
        // implementation: undefined,
        inputEncoding: "",
        lastModified: "",
        linkColor: "",
        links: undefined,
        location: undefined,
        onfullscreenchange: null,
        onfullscreenerror: null,
        onpointerlockchange: null,
        onpointerlockerror: null,
        onreadystatechange: null,
        onvisibilitychange: null,
        ownerDocument: null,
        pictureInPictureEnabled: false,
        plugins: undefined,
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
      };
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

async function loadPDFDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  document: DocumentData<T, K>,
  dataCallback: (data: WritableDraft<DocumentObject<T, K>>) => void
): Promise<string> {
  try {
    const pdfBytes =
      typeof document.content === "string"
        ? Uint8Array.from(atob(document.content), (c) => c.charCodeAt(0))
        : document.content;

    // Correctly await the getDocument call
    const pdfDocProxy = await getDocument({ data: pdfBytes });

    let text = "";

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPageCount();
    for (let i = 0; i < numPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const pageText = await extractTextFromPage(page as CustomPDFProxyPage);
      text += pageText;
    }

    const updatedDocument = { ...document, content: text };
    dataCallback(updatedDocument as WritableDraft<DocumentObject<T, K>>);

    return text;
  } catch (error) {
    console.error("Error loading PDF document content:", error);
    throw error;
  }
}

async function loadMarkdownDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  document: DocumentPath,
  dataCallback: (data: WritableDraft<DocumentObject<T, K>>) => void
): Promise<string> {
  try {
    // Assuming the Markdown file path is stored in the document's filePathOrUrl property
    const filePath = document.filePathOrUrl;

    // Read the Markdown file
    const markdownContent = await fs.promises.readFile(filePath, "utf-8");

    // Call dataCallback with the modified document
    const updatedDocument = { ...document, content: markdownContent };
    dataCallback(updatedDocument as WritableDraft<DocumentObject<T, K>>);

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
async function loadDrawingDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  documentId: DocumentData<T, K>
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

async function loadPresentationDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  presentationId: DocumentObject<T, K>
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

async function loadGenericDocumentContent<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  documentId: DocumentObject<T, K>,
  format: string,
  dataCallback: (data: WritableDraft<DocumentObject<T, K>>) => void
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

async function loadDocumentContentFromDatabase<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  pdfType: YourPDFType,
  [],
  pdfData: string | Uint8Array,
  pdfFilePath: string,
  parsedData: ParsedData<PDFData>[],
  pdfDataType: YourPDFType[],
  appType: AppType,
  documentId: number,
  format: string,
  dataCallback: (data: WritableDraft<DocumentData<T, K>>) => void
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
      levels: { ...defaultOptions.levels }, // Use default levels structure
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
      error: null,
    });

    return "documentContent";
  }
}

async function loadCryptoWatchDocumentContent(
  documentId: DocumentData<T, K>,
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
  document: DocumentObject<T, K>,
  dataCallback: (data: WritableDraft<DocumentData<T, K>>) => void,
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

function loadSpreadsheetDocumentContent(document: DocumentData<T, K>): string {
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

export {
    extractTextFromPDF, loadCalendarEventsDocumentContent, loadClientPortfolioDocumentContent, loadCryptoWatchDocumentContent, loadDiagramDocumentContent, loadDocumentContent, loadDraftDocumentContent, loadDrawingDocumentContent, loadFinancialReportDocumentContent, loadGenericDocumentContent, loadMarkdownDocumentContent, loadMarketAnalysisDocumentContent, loadOtherDocumentContent, loadPDFDocumentContent, loadPresentationDocumentContent,
    loadSpreadsheetDocumentContent, loadSQLDocumentContent, loadTextDocumentContent
};

