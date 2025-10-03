import { AxiosError } from "axios";
import { ExchangeData } from "@/app/components/models/data/ExchangeData";
import { YourResponseType } from "@/app/components/typings/types";
import useSecureExchangeId from "@/app/hooks/useSecureExchangeId";
import {
  apiNotificationMessages,
  fetchData,
  handleApiErrorAndNotify,
} from "./ApiData";

// Define your notification messages interface
interface DataNotificationMessages {
  FETCH_EXCHANGE_DATA_ERROR: keyof typeof apiNotificationMessages; // Ensure it matches your actual notification message ID
  // Add more notification IDs as needed
}

// Function to fetch exchange data
export const fetchExchangeData = async <
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(): Promise<Exchange<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    
    const id = useSecureExchangeId(); // Use the newly created hook here
    if (!id) {
      throw new Error("Exchange ID is not available.");
    }
    
    const endpoint = `${process.env.REACT_APP_API_BASE_URL}/exchangeData`; // Replace with your actual exchange data endpoint
    const response = await fetchData(endpoint, id);

    if (!response || !response.data) {
      throw new Error(
        "Failed to fetch exchange data: Response or response.data is null"
      );
    }

    // Assuming YourResponseType needs to be transformed to ExchangeData[]
    const exchangeDataArray: Exchange<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] =
      transformYourResponseToExchangeData(response.data);

    return exchangeDataArray;
  } catch (error) {
    console.error("Error fetching exchange data:", error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch exchange data",
      "FETCH_EXCHANGE_DATA_ERROR"
    );
    throw error; // Re-throw the error after handling
  }
};'use server';

import fs from 'fs';
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import Docxtemplater from "docxtemplater";
import { BaseData } from "@/app/components/models/data/Data";
import PizZip from "pizzip";
import path from 'path';
import { DocumentOptions } from '@/app/components/documents/DocumentOptions';
import { generateFinancialReportContent } from '@/app/components/documents/documentation/report/generateFinancialReportContent';

export enum DocumentTypeEnum {
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

export enum DocumentStatusEnum {
  Draft = 'draft',
  Finalized = 'finalized',
  Archived = 'archived',
  Deleted = 'deleted'
}

export class ServerDocumentGenerator {
  async createTextDocument(
    type: DocumentTypeEnum,
    options: DocumentOptions,
    fileContent: Buffer
  ): Promise<string> {
    const content = options.content || "Default Text Document Content";
    const contentData = { content };

    const zip = new PizZip(fileContent);
    const docx = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    docx.setData(contentData);

    try {
      docx.render();
      const result = docx.getZip().generate({ type: "nodebuffer" });

      const generatedFilePath = path.join(process.cwd(), 'generated', 'textDocument.docx');
      await fs.promises.mkdir(path.dirname(generatedFilePath), { recursive: true });
      await fs.promises.writeFile(generatedFilePath, result);

      return `Text Document created successfully at ${generatedFilePath}.`;
    } catch (error: any) {
      console.error("Error creating text document:", error);
      throw new Error("Error creating text document: " + error.message);
    }
  }

  async createFinancialReport(options: DocumentOptions, documents: DocumentData<BaseData<any>>): Promise<string> {
    const financialReportContent = "Financial Report Content";
    const financialReportFileName = "financial_report.docx";

    try {
      await generateFinancialReportContent(options, [documents]);
      const generatedFilePath = path.join(process.cwd(), 'generated', financialReportFileName);
      await fs.promises.writeFile(generatedFilePath, financialReportContent);
      return `Financial Report created successfully at ${generatedFilePath}.`;
    } catch (error) {
      console.error("Error creating financial report:", error);
      throw new Error("Error creating financial report.");
    }
  }

  // Server-only methods
  async getGeneratedDocumentsList(): Promise<string[]> {
    try {
      const generatedDir = path.join(process.cwd(), 'generated');
      await fs.promises.mkdir(generatedDir, { recursive: true });
      return await fs.promises.readdir(generatedDir);
    } catch (error) {
      console.error("Error reading generated documents:", error);
      return [];
    }
  }

  async deleteDocument(fileName: string): Promise<boolean> {
    try {
      const filePath = path.join(process.cwd(), 'generated', fileName);
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }
}

// Using the full 5-parameter defaults
const transformYourResponseToExchangeData = <
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  yourResponse: YourResponseType<T, K, Meta, AttachmentType, ExcludedFields>
): ExchangeData[] => {
  // Example transformation logic
  const transformedData: ExchangeData[] = yourResponse.data!.exchangeData.map(
    (item) => ({
      id: item.id,
      name: item.name,
      volume: item.volume,
      liquidity: item.liquidity,
      tokens: item.tokens,
      pair: item.pair,
      price: item.price,
      type: item.type,
      data: item.data,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      // Map other properties as needed
    })
  );

  return transformedData;
};
