import React, { useState } from "react";
import FeedbackService from "../support/FeedbackService";
import { Feedback } from "../support/Feedback";
import FeedbackForm from "@/app/pages/forms/FeedbackForm";
import FeedbackReportGenerator, { FeedbackReport } from "@/app/generators/FeedbackReportGenerator";
import FeedbackLoop from "../FeedbackLoop";

enum FeedbackPhaseEnum {
    FEEDBACK_SELECTION = "FEEDBACK_SELECTION",
    FEEDBACK_PROVIDING = "FEEDBACK_PROVIDING",
    FEEDBACK_PROCESSING = "FEEDBACK_PROCESSING",
    FEEDBACK_ANALYSIS = "FEEDBACK_ANALYSIS",
    FEEDBACK_REPORTING = "FEEDBACK_REPORTING",

    FEEDBACK_COLLECTION = 'FEEDBACK_COLLECTION',
}

const FeedbackProcess: React.FC = () => {
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [feedbackType, setFeedbackType] = useState<string>("text"); // Default feedback type 
  const [currentPhase, setCurrentPhase] = useState<FeedbackPhaseEnum>(
    FeedbackPhaseEnum.FEEDBACK_COLLECTION
  );

  const handleSubmitFeedback = (feedback: Feedback) => {
    // Add the submitted feedback to the data array
    setFeedbackData([...feedbackData, feedback]);
  };

  const handleProcessFeedback = () => {
    // Change phase to feedback processing
    setCurrentPhase(FeedbackPhaseEnum.FEEDBACK_PROCESSING);

    // Process the feedback data
    const feedbackService = FeedbackService.getInstance();
    feedbackService.gatherFeedback(feedbackData, feedbackType);

    // Generate feedback report
    const feedbackReport: FeedbackReport = FeedbackReportGenerator.generateFeedbackReport(feedbackData);
    console.log(feedbackReport); // Example: Log the feedback report

    // Change phase to feedback reporting
    setCurrentPhase(FeedbackPhaseEnum.FEEDBACK_REPORTING);
  };

  return (
    <div>
      <h1>Feedback Collection and Reporting</h1>
      {currentPhase === FeedbackPhaseEnum.FEEDBACK_COLLECTION && (
        <>
          <FeedbackForm onSubmit={handleSubmitFeedback} />
          <button onClick={handleProcessFeedback}>Process Feedback</button>
        </>
      )}
      {currentPhase === FeedbackPhaseEnum.FEEDBACK_REPORTING && (
        <>
          {/* Render feedback report or its components here */}
          <hr />
        </>
      )}
      <h2>Feedback Loop</h2>
      {/* Render individual feedback items using FeedbackLoop */}
      {feedbackData.map((feedback, index) => (
        <FeedbackLoop
          key={index}
          feedback={feedback}
          feedbackType={feedbackType}
        />
      ))}
    </div>
  );
};

export default FeedbackProcess;
export { FeedbackPhaseEnum };
