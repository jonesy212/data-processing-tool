import { createSnapshot } from '@/app/api/SnapshotApi';
import { endpoints } from '@/app/api/ApiEndpoints';
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import axios from 'axios';
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
    // Use type guards to process each report type
    if (isFinancialReport(report)) {
      console.log("Processing Financial Report:", report.title);
      processFinancialMetrics(report.financialMetrics);

      // Convert to Snapshot-compatible format
      const snapshot = createSnapshotInstance(
        report.id.toString(),              // snapshotId
        report,                            // data
        report.category ?? "Financial",    // category
        null,                              // snapshotStore
        null,                              // snapshotStoreConfig
        null,                              // snapshotManager
        undefined                          // storeProps
      );

      saveToSnapshotStore(snapshot);
    } else if (isTechnicalReport(report)) {
      console.log("Processing Technical Report:", report.title);
      processTechnicalSpecifications(report.technicalSpecifications);

      const snapshot = createSnapshotInstance(
        report.id.toString(),
        report,
        report.category ?? "Technical",
        null,
        null,
        null,
        undefined
      );

      saveToSnapshotStore(snapshot);
    } else if (isResearchReport(report)) {
      console.log("Processing Research Report:", report.title);
      analyzeResearchFindings(report.researchFindings);

      const snapshot = createSnapshotInstance(
        report.id.toString(),
        report,
        report.category ?? "Research",
        null,
        null,
        null,
        undefined
      );

      saveToSnapshotStore(snapshot);
    } else {
      console.warn("Unknown report type:", report.title);
    }
  });
};




// Define saveReportSnapshot to include the report and reportType as additional properties
const saveReportSnapshot = (report: AddReportType, reportType: string): void => {
  // Define the snapshot data for the report
  const snapshotData: Snapshot<AddReportType> = {
    id: generateUniqueId(), // Assuming you have a utility function for unique IDs
    data: report,
  };

  // Create a snapshot with additional properties for the report
  const snapshot = createSnapshot(snapshotData, { reportType });
  
  // Save the created snapshot to the SnapshotStore
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
