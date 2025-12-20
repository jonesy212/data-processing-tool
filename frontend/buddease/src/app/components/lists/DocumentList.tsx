// DocumentList.tsx
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import { WritableDraft } from '@/app/state/redux/ReducerGenerator';
import { addDocument } from '@/app/api/ApiDocument';
import { selectDocuments } from '@/app/state/redux/slices/DocumentSlice'
import { useDispatch, useSelector } from 'react-redux';

const DocumentList = () => {
  const documents = useSelector(selectDocuments);
  const dispatch = useDispatch();

  const handleAddDocument = (newDocument: WritableDraft<DocumentData>) => {
    dispatch(addDocument(newDocument));
  };

  // Render the document list
  return (
    <div>
      {documents.map((doc) => (
        <div key={doc.id}>{doc.title}</div>
      ))}
      <button onClick={() => handleAddDocument({
          id: 4, title: 'New Document',
          content: '',
          topics: [],
          highlights: [],
          keywords: [],
          permissions: undefined,
          folders: [],
          options: undefined,
          folderPath: '',
          previousMetadata: undefined,
          currentMetadata: undefined,
          accessHistory: [],
          lastModifiedDate: undefined,
          versionData: undefined,
          version: undefined,
          _id: ''
      })}>
        Add Document
      </button>
    </div>
  );
};
