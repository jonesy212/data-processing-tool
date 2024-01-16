import React from 'react';
import FileCard from './FileCard';
import FolderCard from './FolderCard';

interface DummyCardLoaderProps {
  items: { type: 'file' | 'folder'; name: string }[];
}

const DummyCardLoader: React.FC<DummyCardLoaderProps> = ({ items }) => {
  return (
    <div>
      <h3>Dummy Card Loader</h3>
      {items.map((item, index) => (
        <div key={index}>
          {item.type === 'file' && <FileCard fileName={item.name} />}
          {item.type === 'folder' && <FolderCard folderName={item.name} />}
        </div>
      ))}
    </div>
  );
};

export default DummyCardLoader;
