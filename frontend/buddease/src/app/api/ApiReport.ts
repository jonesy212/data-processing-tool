import { createSnapshot } from '@/app/api/SnapshotApi';
import { endpoints } from '@/app/api/ApiEndpoints';
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import axiosInstance from "@/app/components/security/csrfToken";
import { BaseReport, FinancialReport, ReportOptions,
  TechnicalReport, ResearchReport,
  AddReportBase
 } from '../components/documents/documentation/report/Report';
import { FinancialMetrics, processFinancialMetrics } from '../components/metrics/FinancialMetrics';
import { processTechnicalSpecifications, TechnicalSpecifications } from '../components/metrics/TechnicalSpecifications';
import { Snapshot } from '../components/snapshots';
import { analyzeResearchFindings, ResearchFindings } from '../pages/searchs/ResearchFindings';
import { isFinancialReport, isTechnicalReport, isResearchReport } from '../typings/reportTypeGuards';
import { createSnapshotInstance } from '../components/snapshots/createSnapshotInstance';

// Define the API base URL for reports
const API_BASE_URL = endpoints.reports.list

export type AddReportType = FinancialReport | TechnicalReport | ResearchReport;

interface AddReport extends AddReportBase {
  reportType?: "financial" | "technical" | "research";
  financialMetrics?: FinancialMetrics;
  fiscalYear?: number;
  technicalSpecifications?: TechnicalSpecifications;
  projectCode?: string;
  researchFindings?: ResearchFindings;
  experimentDate?: Date;
}

export const processReports = (reports: AddReport[]): void => {
  reports.forEach(report => {
    const reportType = report.reportType ?? "unknown";

    if (reportType === "financial") {
      console.log("Processing Financial Report:", report.title);
      processFinancialMetrics((report as FinancialReport).financialMetrics);
      saveToSnapshotStore(
        createSnapshotInstance(report.id.toString(), report, report.category ?? "Financial")
      );
    } else if (reportType === "technical") {
      console.log("Processing Technical Report:", report.title);
      processTechnicalSpecifications((report as TechnicalReport).technicalSpecifications);
      saveToSnapshotStore(
        createSnapshotInstance(report.id.toString(), report, report.category ?? "Technical")
      );
    } else if (reportType === "research") {
      console.log("Processing Research Report:", report.title);
      analyzeResearchFindings((report as ResearchReport).researchFindings);
      saveToSnapshotStore(
        createSnapshotInstance(report.id.toString(), report, report.category ?? "Research")
      );
    } else {
      console.warn("Unknown report type:", report.title);
    }
  });
};




const saveReportSnapshot = (report: AddReportType, reportType: string): void => {
  // Generate a base snapshot using createSnapshotInstance
  const baseSnapshot = createSnapshotInstance(
    generateUniqueId(),     // Snapshot ID
    report,                 // Report data
    report.category ?? "DefaultCategory", // Category
    null,                   // SnapshotStore (or other related objects)
    null,                   // SnapshotStoreConfig
    null,                   // SnapshotManager
    { reportType }          // Add the reportType or other properties as needed
  );

  // Now, spread the baseSnapshot and add custom properties (like `id`)
  const snapshotData = {
    ...baseSnapshot,          // Spread the base snapshot to retain required properties
    id: generateUniqueId(),   // Override the ID if needed
    // Add other properties specific to your use case, such as `reportType`
    reportType,               // Add the reportType (or other properties)
  };

  // Create a snapshot using the final snapshot data
  const snapshot = createSnapshot(snapshotData);

  // Save the snapshot to the SnapshotStore
  saveToSnapshotStore(snapshot);
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

    const response = await axios.get(`${API_BASE_URL}?${queryParams.toString()}`, { headers: headersConfig });
    return response.data.reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};


// Function to add a new report
export const addReport = async (newReport: Omit<AddReportType, 'id'>): Promise<void> => {
  try {
    const addReportEndpoint = `${API_BASE_URL}/add`; // Ensure the endpoint is correctly formatted
    await axios.post(addReportEndpoint, newReport, { headers: headersConfig });
    console.log('Report added successfully.');
  } catch (error) {
    console.error('Error adding report:', error);
    throw error;
  }
};

// Function to remove a report
export const removeReport = async (reportId: number): Promise<void> => {
  try {
    const removeReportEndpoint = `${API_BASE_URL}.remove.${reportId}`;
    await axios.delete(removeReportEndpoint, { headers: headersConfig });
  } catch (error) {
    console.error('Error removing report:', error);
    throw error;
  }
};


export type { AddReport }