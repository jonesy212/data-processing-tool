// reportUtils.ts
// Define utility functions related to reports

import { Report } from "../components/documents/documentation/report/Report";

// Function to generate a report filename
export const generateReportFilename = (report: Report): string => {
  return `${report.title.replace(/\s/g, '_')}_${report.id}.pdf`;
};

// Function to validate a report
export const validateReport = (report: Report): boolean => {
  // Perform validation checks on the report object
  return report.title.length > 0 && report.description.length > 0;
};

// Other utility functions for reports can be added here
