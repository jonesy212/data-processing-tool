import { endpoints } from '@/app/api/ApiEndpoints';
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import axios from 'axios';
import dotProp from 'dot-prop';
import { Report } from '../components/documents/documentation/report/Report';

// Define the API base URL for reports
const API_BASE_URL = dotProp.getProperty(endpoints, 'reports.list');

// Function to fetch a list of reports
export const fetchReports = async (): Promise<Report[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, { headers: headersConfig });
    return response.data.reports;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Function to add a new report
export const addReport = async (newReport: Omit<Report, 'id'>): Promise<void> => {
  try {
    const addReportEndpoint = `${API_BASE_URL}.add`;
    await axios.post(addReportEndpoint, newReport, { headers: headersConfig });
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
