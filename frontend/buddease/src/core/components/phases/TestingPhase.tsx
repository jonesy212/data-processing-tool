// components/phases/TestingPhase.tsx

import { TaskManagementPhase } from "@/core/projects/TaskManagementPhase";
import React from "react";

interface TestingPhaseProps {
  onSubmit: (nextPhase: TaskManagementPhase) => void;
}

const TestingPhase: React.FC<TestingPhaseProps> = ({ onSubmit }) => {
  const [testResults, setTestResults] = React.useState<{
    passed: number;
    failed: number;
    total: number;
  }>({ passed: 0, failed: 0, total: 10 });
  
  const [isRunningTests, setIsRunningTests] = React.useState(false);

  const runTests = () => {
    setIsRunningTests(true);
    // Simulate test execution
    setTimeout(() => {
      setTestResults({
        passed: 8,
        failed: 2,
        total: 10
      });
      setIsRunningTests(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (testResults.failed === 0) {
      onSubmit(TaskManagementPhase.COMPLETION);
    } else {
      alert("Please fix all test failures before proceeding.");
    }
  };

  return (
    <div className="testing-phase">
      <h2>Testing Phase</h2>
      <div className="test-controls">
        <button 
          onClick={runTests} 
          disabled={isRunningTests}
          className="run-tests-btn"
        >
          {isRunningTests ? "Running Tests..." : "Run Tests"}
        </button>
      </div>
      
      <div className="test-results">
        <h3>Test Results</h3>
        <div className="result-stats">
          <div className="stat passed">
            <span className="label">Passed:</span>
            <span className="value">{testResults.passed}</span>
          </div>
          <div className="stat failed">
            <span className="label">Failed:</span>
            <span className="value">{testResults.failed}</span>
          </div>
          <div className="stat total">
            <span className="label">Total:</span>
            <span className="value">{testResults.total}</span>
          </div>
          <div className="stat coverage">
            <span className="label">Coverage:</span>
            <span className="value">{((testResults.passed / testResults.total) * 100).toFixed(1)}%</span>
          </div>
        </div>
        
        {testResults.failed > 0 && (
          <div className="failed-tests">
            <h4>Failed Tests:</h4>
            <ul>
              <li>Test #3: User authentication timeout</li>
              <li>Test #7: Data validation for special characters</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="action-buttons">
        <button 
          onClick={() => onSubmit(TaskManagementPhase.EXECUTION)}
          className="back-btn"
        >
          Back to Execution
        </button>
        <button 
          onClick={handleSubmit}
          disabled={testResults.total === 0}
          className="submit-btn"
        >
          Complete Testing
        </button>
      </div>
    </div>
  );
};

export default TestingPhase;