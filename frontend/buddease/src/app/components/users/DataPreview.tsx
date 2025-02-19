// DataPreview.tsx
import { UserData } from '@/app/components/users/User';
import React from 'react';

interface DataPreviewProps {
  data: UserData; 
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  return (
    <div>
      <h2>Data Preview</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DataPreview;
export type { DataPreviewProps };
