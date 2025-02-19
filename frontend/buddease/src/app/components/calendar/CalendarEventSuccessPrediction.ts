// CalendarEventSuccessPrediction.ts
interface CalendarEventSuccessPrediction {
    eventId: string; // ID of the event being predicted
    successProbability: number; // Probability of the event's success (between 0 and 1)
    confidenceScore: number; // Confidence score associated with the prediction
  }
  
  export default CalendarEventSuccessPrediction;
  