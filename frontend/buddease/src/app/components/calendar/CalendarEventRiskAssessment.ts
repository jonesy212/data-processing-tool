// CalendarEventRiskAssessment.ts
interface CalendarEventRiskAssessment {
    eventId: string; // ID of the event
    riskScore: number; // Risk score assigned to the event
    riskLevel: "Low" | "Medium" | "High"; // Risk level categorization (e.g., low, medium, high)
    riskFactors: string[]; // Array of risk factors contributing to the assessment
    // Add any additional properties or methods as needed
  }
  
  export default CalendarEventRiskAssessment;
  