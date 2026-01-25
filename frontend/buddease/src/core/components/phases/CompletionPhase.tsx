// CompletionPhase.tsx
components/phases/CompletionPhase.tsx
import React from "react";

const CompletionPhase: React.FC = () => {
  const [completionData, setCompletionData] = React.useState({
    projectName: "",
    finalReport: "",
    lessonsLearned: "",
    rating: 5,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompletionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating: number) => {
    setCompletionData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = () => {
    console.log("Completion data:", completionData);
    alert("Project completed successfully! Check the console for completion data.");
    
    // You could add API call here to save completion data
    // saveCompletionData(completionData);
  };

  const downloadReport = () => {
    const reportContent = `
      Project Completion Report
      ========================
      
      Project Name: ${completionData.projectName}
      Completion Date: ${new Date().toLocaleDateString()}
      Final Rating: ${completionData.rating}/5
      
      Final Report:
      ${completionData.finalReport}
      
      Lessons Learned:
      ${completionData.lessonsLearned}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `completion-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="completion-phase">
      <h2>🎉 Project Completion 🎉</h2>
      <div className="completion-message">
        <p>Congratulations! You have successfully completed all phases of the project.</p>
        <p>Please provide final details below:</p>
      </div>
      
      <div className="completion-form">
        <div className="form-group">
          <label htmlFor="projectName">Project Name:</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={completionData.projectName}
            onChange={handleInputChange}
            placeholder="Enter project name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="finalReport">Final Report:</label>
          <textarea
            id="finalReport"
            name="finalReport"
            value={completionData.finalReport}
            onChange={handleInputChange}
            placeholder="Summarize the final outcome..."
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lessonsLearned">Lessons Learned:</label>
          <textarea
            id="lessonsLearned"
            name="lessonsLearned"
            value={completionData.lessonsLearned}
            onChange={handleInputChange}
            placeholder="What did you learn during this project?"
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label>Project Rating:</label>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className={`star ${star <= completionData.rating ? 'active' : ''}`}
                onClick={() => handleRatingChange(star)}
              >
                ★
              </button>
            ))}
            <span className="rating-text">{completionData.rating}/5 stars</span>
          </div>
        </div>
        
        <div className="completion-summary">
          <h3>Completion Summary</h3>
          <ul>
            <li>✅ All phases completed successfully</li>
            <li>✅ All tests passed</li>
            <li>✅ Documentation generated</li>
            <li>✅ Code reviewed and approved</li>
            <li>✅ Deployment ready</li>
          </ul>
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          onClick={downloadReport}
          className="download-btn"
        >
          📥 Download Completion Report
        </button>
        <button 
          onClick={handleSubmit}
          disabled={!completionData.projectName.trim()}
          className="submit-btn"
        >
          Mark as Complete
        </button>
      </div>
      
      <div className="next-steps">
        <h3>Next Steps:</h3>
        <ul>
          <li>Archive project documentation</li>
          <li>Schedule retrospective meeting</li>
          <li>Update portfolio with completed project</li>
          <li>Plan for maintenance and support</li>
        </ul>
      </div>
    </div>
  );
};

export default CompletionPhase;