// FrontendDocumentConfig.tsx

import React, { useState } from 'react';

const FrontendDocumentConfig: React.FC = () => {
  const [documentSettings, setDocumentSettings] = useState({
    // Initialize with default values or fetch from backend
    documentTitle: '',
    documentFormat: 'pdf',
    documentPageSize: 'A4',
    // Add more document settings as needed
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setDocumentSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logic to submit document settings to backend
    console.log('Document settings submitted:', documentSettings);
  };

  return (
    <div>
      <h2>Frontend Document Configuration</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Document Title:
          <input type="text" name="documentTitle" value={documentSettings.documentTitle} onChange={handleInputChange} />
        </label>
        {/* Add more input fields for other document settings */}
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
};

export default FrontendDocumentConfig;
