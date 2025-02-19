import React, { useState } from "react";

const HypothesisTesting: React.FC<{ onTestRun: (selectedTest: string) => void }> = ({
  onTestRun,
}) => {
  const [selectedTest, setSelectedTest] = useState<string>("t-test");

  const handleTestChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTest(event.target.value);
  };

  const handleRunTest = () => {
    onTestRun(selectedTest);
  };

  return (
    <form>
      <label htmlFor="testType">Select Hypothesis Test:</label>
      <select
        id="testType"
        value={selectedTest}
        onChange={handleTestChange}
      >
        <option value="t-test">T-Test</option>
        <option value="chi-squared">Chi-Squared</option>
        <option value="z-test">Z-Test</option>
      </select>
      <button type="button" onClick={handleRunTest}>
        Run Hypothesis Test
      </button>
    </form>
  );
};

export default HypothesisTesting;
