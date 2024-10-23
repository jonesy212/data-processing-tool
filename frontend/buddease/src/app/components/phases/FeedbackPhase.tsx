import FeedbackReportGenerator, { FeedbackReport } from "@/app/generators/FeedbackReportGenerator";
import FeedbackForm from "@/app/pages/forms/FeedbackForm";
import React, { useState } from "react";
import FeedbackLoop from "../FeedbackLoop";
import { Feedback } from "../support/Feedback";
import FeedbackService from "../support/FeedbackService";
import { Channel, ChannelType } from "../interfaces/chat/Channel";

enum FeedbackPhaseEnum {
    FEEDBACK_SELECTION = "FEEDBACK_SELECTION",
    FEEDBACK_PROVIDING = "FEEDBACK_PROVIDING",
    FEEDBACK_PROCESSING = "FEEDBACK_PROCESSING",
    FEEDBACK_ANALYSIS = "FEEDBACK_ANALYSIS",
    FEEDBACK_REPORTING = "FEEDBACK_REPORTING",
    FEEDBACK_REVIEW = "FEEDBACK_REVIEW",
    FEEDBACK_COLLECTION = 'FEEDBACK_COLLECTION',
}

const FeedbackProcess: React.FC = () => {
  const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
  const [feedbackType, setFeedbackType] =  useState<ChannelType>(ChannelType.Text);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null); // State for Channel
  const [currentPhase, setCurrentPhase] = useState<FeedbackPhaseEnum>(
    FeedbackPhaseEnum.FEEDBACK_COLLECTION
  );

  const handleFeedbackTypeChange = (newType: string) => {
    if (Object.values(ChannelType).includes(newType as ChannelType)) {
      setFeedbackType(newType as ChannelType);
    } else {
      console.error("Invalid feedback type");
    }
  };


  const handleSubmitFeedback = (feedback: Feedback) => {
    setFeedbackData([...feedbackData, feedback]);
  };

  const handleChannelChange = (channel: Channel) => {
    setCurrentChannel(channel);
  };

  const handleProcessFeedback = () => {
    setCurrentPhase(FeedbackPhaseEnum.FEEDBACK_PROCESSING);

    if (!currentChannel) {
      console.error("No channel selected.");
      return;
    }

    const feedbackService = FeedbackService.getInstance();
    feedbackService.gatherFeedback(feedbackData, currentChannel);

    const feedbackReport: FeedbackReport = FeedbackReportGenerator.generateFeedbackReport(feedbackData);
    console.log(feedbackReport);

    setCurrentPhase(FeedbackPhaseEnum.FEEDBACK_REPORTING);
  };
  return (
    <div>
      <h1>Feedback Collection and Reporting</h1>
      {currentPhase === FeedbackPhaseEnum.FEEDBACK_COLLECTION && (
        <>
          <FeedbackForm onSubmit={handleSubmitFeedback} />
          {/* Example channel selection */}
          <button onClick={() => handleChannelChange({
            id: 'channel1',
            name: 'Feedback Channel',
            type: ChannelType.Text, // Use a specific enum value
            members: [],
            messages: []
          })}>
            Select Channel
          </button>
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
          feedback={[feedback]}
          feedbackType={currentChannel?.type || ChannelType.Text} // Provide fallback if no channel is selected
        
        />
      ))}
    </div>
  );
};

export default FeedbackProcess;
export { FeedbackPhaseEnum };
