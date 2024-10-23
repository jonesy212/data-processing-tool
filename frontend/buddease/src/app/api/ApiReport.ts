import { endpoints } from '@/app/api/ApiEndpoints';
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import axios from 'axios';
import dotProp from 'dot-prop';
import { BaseReport, FinancialReport, ReportOptions,
  TechnicalReport, ResearchReport
 } from '../components/documents/documentation/report/Report';

// Define the API base URL for reports
const API_BASE_URL = dotProp.getProperty(endpoints, 'reports.list');

export type AddReport = FinancialReport | TechnicalReport | ResearchReport;

export const processReports = (reports: BaseReport[]): void => {
  reports.forEach(report => {
    if ('financialMetrics' in report) {
      // Handle FinancialReport
    } else if ('technicalSpecifications' in report) {
      // Handle TechnicalReport
    } else if ('researchFindings' in report) {
      // Handle ResearchReport
    }
  });
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
export const addReport = async (newReport: Omit<AddReport, 'id'>): Promise<void> => {
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

// Other report-related functions can be added here
