// ApiReport.ts
import internalApiService from '@/app/api/ApiClient';
import { endpoints } from '@/app/api/endpointConfigurations';
import { FinancialMetrics, processFinancialMetrics } from '@/app/components/metrics/FinancialMetrics';
import { processTechnicalSpecifications, TechnicalSpecifications } from '@/app/components/metrics/TechnicalSpecifications';
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import {
  AddReportBase,
  BaseReport, FinancialReport, ReportOptions,
  ResearchReport,
  TechnicalReport
} from '@/app/documents/Report';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { analyzeResearchFindings, ResearchFindings } from '@/app/pages/searches/ResearchFindings';
import { createSnapshot } from '@/app/snapshots/createSnapshot';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { storeProps } from '@/app/snapshots/SnapshotStoreProps';

import { Attachment } from '@/app/documents/attachment/Attachment';

// Define the API base URL for reports
const API_BASE_URL = endpoints.reports.list

export type AddReportType = FinancialReport | TechnicalReport | ResearchReport;

// The combined interface
interface AddReport<T extends BaseDataEntity> extends AddReportBase<T> {
  title?: string;
  reportType?: "financial" | "technical" | "research";
  financialMetrics?: FinancialMetrics;
  fiscalYear?: number;
  technicalSpecifications?: TechnicalSpecifications;
  projectCode?: string;
  researchFindings?: ResearchFindings;
  experimentDate?: Date;
  processedMetrics?: {
    profit?: number;
    efficiency?: number;
    isStable?: boolean;
  };
  
  technicalAnalysis?: {
    hasHighPerformance?: boolean;
    techStackSize?: number;
  };
}

type ProcessableReport = AddReport<any> & {
  reportType?: "financial" | "technical" | "research";
  title?: string;
  financialMetrics?: FinancialMetrics;
  technicalSpecifications?: TechnicalSpecifications;
  researchFindings?: ResearchFindings;
};


export const processReports = async <T extends BaseDataEntity>(
  reports: AddReport<T>[]
): Promise<void> => {
  const results = await Promise.allSettled(
    reports.map(async (report) => {
      const reportType = report.reportType ?? "unknown";
      
      // Process report-specific metrics based on type
      await processReportMetrics(report);
   
      // Create base metadata map
      const baseMeta = new Map();
      baseMeta.set('reportType', reportType);
      baseMeta.set('processedAt', new Date().toISOString());

      const {} = storeProps
      const snapshot = await createSnapshot(
        report, // baseData
        baseMeta, // baseMeta with report metadata
        `report-${report.id}`, // snapshotId
        null, // snapshotStore
        null, // snapshotManager  
        null, // snapshotStoreConfig
        false, // isSubscribed
        report.category ?? reportType, // category
        {
          prefix: 'report',
          name: report.title,
          type: 'document',
          storeId, endpointCategory, expirationDate, config,
        } // storeProps
      );

      await saveToSnapshotStore(snapshot);
      
      return {
        reportId: report.id,
        snapshotId: snapshot.id,
        status: 'success' as const
      };
    })
  );

  // Log results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`✅ Processed report ${reports[index].title}`);
    } else {
      console.error(`❌ Failed to process report ${reports[index].title}:`, result.reason);
    }
  });
};




const saveReportSnapshot = async (report: AddReportType, reportType: string): Promise<void> => {
  try {
    // Generate unique ID once
    const snapshotId = UniqueIDGenerator.generateReportId();

    // Create base metadata with report information
    const baseMeta = new Map();
    baseMeta.set('reportType', reportType);
    baseMeta.set('originalCategory', report.category);
    baseMeta.set('createdAt', new Date().toISOString());

    // Create the snapshot directly with all needed properties
    const snapshot = await createSnapshot(
      report,                    // baseData: T
      baseMeta,                  // baseMeta: Map<string, Snapshot...>
      snapshotId,                // snapshotId: string
      null,                      // snapshotStore (can be null)
      null,                      // snapshotManager (can be null)
      null,                      // snapshotStoreConfig (can be null)
      false,                     // isSubscribed
      report.category ?? "DefaultCategory", // category
      {                          // storeProps
        prefix: 'report',
        name: report.title || 'Untitled Report',
        type: 'document',
        endpointCategory: "",
        expirationDate: new Date(),
        config: "",
        storeId: '',
        schema: {},
        initialState: '',
        operation: '',
        
      },
      undefined,                 // storeOptions (optional)
      undefined,                 // categoryProperties (optional)
      undefined,                 // dataStore (optional)
      undefined,                 // dataStoreMethods (optional)
      { reportType } as any      // metadata - cast to appropriate type
    );

    // Save the snapshot to the SnapshotStore
    await saveToSnapshotStore(snapshot);
    
    console.log(`✅ Report snapshot saved: ${snapshotId}`, {
      reportType,
      category: report.category,
      title: report.title
    });

  } catch (error) {
    console.error(`❌ Failed to save report snapshot:`, error);
    throw new Error(`Failed to save report snapshot: ${(error as Error).message}`);
  }
};



const saveToSnapshotStore = (snapshot: Snapshot<AddReportType>): void => {
  try {
    // Fetch the current snapshots stored in localStorage (if any)
    const existingSnapshots = JSON.parse(localStorage.getItem('snapshots') || '[]');

    // Add the new snapshot to the existing snapshots array
    existingSnapshots.push(snapshot);

    // Store the updated snapshots array back in localStorage
    localStorage.setItem('snapshots', JSON.stringify(existingSnapshots));

    console.log("Successfully saved report to snapshot store:", snapshot);
  } catch (error) {
    console.error("Failed to save report to snapshot store:", error);
  }
};


// Function to fetch a list of reports
export const fetchReports = async (options: ReportOptions = {}): Promise<BaseReport[]> => {
  try {
    // Construct query parameters based on options
    const queryParams = new URLSearchParams();
    if (options.type) queryParams.append('type', options.type);
    if (options.fiscalYear) queryParams.append('fiscalYear', options.fiscalYear.toString());
    if (options.projectCode) queryParams.append('projectCode', options.projectCode);
    if (options.experimentDate) queryParams.append('experimentDate', options.experimentDate.toISOString());

    const response = await internalApiService.get(`${API_BASE_URL}?${queryParams.toString()}`, {
      config: { headers: headersConfig }
    });

    return response.data.reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};


// Function to add a new report
export const addReport = async (newReport: Omit<AddReportType, 'id'>): Promise<void> => {
  try {
    // Process metrics before adding
    const processedReport = await processReportWithMetrics(newReport as ProcessableReport);
    
    const addReportEndpoint = `${API_BASE_URL}/add`;
    await internalApiService.post(addReportEndpoint, processedReport, {config: { headers: headersConfig }});
    console.log('Report added successfully with processed metrics.');
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};

// Function to remove a report
export const removeReport = async (reportId: number): Promise<void> => {
  try {
    const removeReportEndpoint = `${API_BASE_URL}.remove.${reportId}`;
    await internalApiService.delete(removeReportEndpoint, {config: { headers: headersConfig }});
  } catch (error) {
    console.error('Error removing report:', error);
    throw error;
  }
};

// Helper function to process metrics based on report type
const processReportMetrics = async (report: ProcessableReport): Promise<void> => {
  switch (report.reportType) {
    case "financial":
      if (report.financialMetrics) {
        console.log(`📊 Processing financial metrics for report: ${report.title}`);
        processFinancialMetrics(report.financialMetrics);
        
        // You could also store processed metrics in the report
        report.processedMetrics = {
          profit: report.financialMetrics.revenue - report.financialMetrics.expenses,
          efficiency: report.financialMetrics.profitMargin / 100,
          isStable: report.financialMetrics.profitMargin > 20
        };
      }
      break;
      
    case "technical":
      if (report.technicalSpecifications) {
        console.log(`🔧 Processing technical specifications for report: ${report.title}`);
        processTechnicalSpecifications(report.technicalSpecifications);
        
        // Store processed technical analysis
        report.technicalAnalysis = {
          hasHighPerformance: report.technicalSpecifications.performanceMetrics.uptime > 99.9,
          techStackSize: report.technicalSpecifications.technologyStack.length
        };
      }
      break;
      
    case "research":
      if (report.researchFindings) {
        console.log(`🔬 Processing research findings for report: ${report.title}`);
        analyzeResearchFindings(report.researchFindings);
      }
      break;
      
    default:
      console.log(`ℹ️ No specific metrics to process for report type: ${report.reportType}`);
  }
};


// Dedicated metrics processing function
const processReportWithMetrics = async (report: ProcessableReport): Promise<ProcessableReport> => {

  console.log(`🔍 Processing metrics for report: ${report.title}`);
  
  const processedReport = { ...report };
  
  switch (report.reportType) {
    case "financial":
      if (report.financialMetrics) {
        processFinancialMetrics(report.financialMetrics);
        processedReport.processedMetrics = {
          profit: report.financialMetrics.revenue - report.financialMetrics.expenses,
          efficiency: report.financialMetrics.profitMargin / 100,
          isStable: report.financialMetrics.profitMargin > 20
        };
      }
      break;
      
    case "technical":
      if (report.technicalSpecifications) {
        processTechnicalSpecifications(report.technicalSpecifications);
        processedReport.technicalAnalysis = {
          hasHighPerformance: report.technicalSpecifications.performanceMetrics.uptime > 99.9,
          techStackSize: report.technicalSpecifications.technologyStack.length
        };
      }
      break;
      
    case "research":
      if (report.researchFindings) {
        analyzeResearchFindings(report.researchFindings);
      }
      break;
  }
  
  return processedReport;
};


export { processReportMetrics, processReportWithMetrics };
export type { AddReport };

