// Reporting.tsx
// Generate reports summarizing the findings and insights from the data analysis, allowing users to make informed decisions.

// import { Report } from "@/core/documents/Report";
import { generateReportFilename, validateReport } from "@/utils/reportUtils";
import React from "react";

interface ReportingProps {
  reports: Report[];
}

const Reporting: React.FC<ReportingProps> = ({ reports }) => {
  return (
    <div>
      <h3>Reporting</h3>
      <ul>
        {reports.map((report, index) => (
          <li key={index}>
            <p>Title: {report.title}</p>
            <p>Description: {report.description}</p>
            <p>Valid: {validateReport(report) ? "Yes" : "No"}</p>
            <p>Filename: {generateReportFilename(report)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reporting;
