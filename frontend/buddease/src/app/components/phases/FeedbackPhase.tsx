// FeedbackPhase.tsx
import React from "react";
import FeedbackLoop from "./FeedbackLoop";
import { useFeedbackManagement } from "./FeedbackManagementContext";

enum FeedbackPhase {
    FEEDBACK_SELECTION = "FEEDBACK_SELECTION",
    FEEDBACK_PROVIDING = "FEEDBACK_PROVIDING",
    FEEDBACK_PROCESSING = "FEEDBACK_PROCESSING",
    FEEDBACK_ANALYSIS = "FEEDBACK_ANALYSIS",
    FEEDBACK_REPORTING = "FEEDBACK_REPORTING",

    FEEDBACK_COLLECTION = 'FEEDBACK_COLLECTION',
}


const FeedbackProcess: React.FC = () => {
    const [feedbackData, setFeedbackData] = useState<string[]>([]);
    const [feedbackType, setFeedbackType] = useState<string>('text'); // Default feedback type
    const [currentPhase, setCurrentPhase] = useState<FeedbackPhase>(FeedbackPhase.FEEDBACK_COLLECTION);

    const handleSubmitFeedback = (feedback: string) => {
        // Add the submitted feedback to the data array
        setFeedbackData([...feedbackData, feedback]);
    };

    const handleProcessFeedback = () => {
        // Change phase to feedback processing
        setCurrentPhase(FeedbackPhase.FEEDBACK_PROCESSING);

        // Process the feedback data
        const feedbackService = FeedbackService.getInstance();
        feedbackService.gatherFeedback(feedbackData, feedbackType);

        // Change phase to feedback reporting
        setCurrentPhase(FeedbackPhase.FEEDBACK_REPORTING);
    };

    return (
        <div>
            <h1>Feedback Collection and Reporting</h1>
            {currentPhase === FeedbackPhase.FEEDBACK_COLLECTION && (
                <>
                    <FeedbackForm onSubmit={handleSubmitFeedback} />
                    <button onClick={handleProcessFeedback}>Process Feedback</button>
                </>
            )}
            {currentPhase === FeedbackPhase.FEEDBACK_REPORTING && (
                <>
                    <FeedbackReportGenerator feedbackData={feedbackData} />
                    <hr />
                </>
            )}
            <h2>Feedback Loop</h2>
            {/* Render individual feedback items using FeedbackLoop */}
            {feedbackData.map((feedback, index) => (
                <FeedbackLoop key={index} feedback={feedback} feedbackType={feedbackType} />
            ))}
        </div>
    );
};

export default FeedbackProcess;