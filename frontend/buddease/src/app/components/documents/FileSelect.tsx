// FileSelect.tsx
import React, { useState } from 'react';
import CustomFile from './File';

interface FileSelectProps { 
  onChange: (file: CustomFile) => void;
}



function FileSelect({ onChange }: FileSelectProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files ? event.target.files[0] : null);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
    </div>
  );
}

export default FileSelect;