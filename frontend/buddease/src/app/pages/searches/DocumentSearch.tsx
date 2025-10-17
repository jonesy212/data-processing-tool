import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function DocumentSearch({ initialSearchTerm: propSearchTerm }) {
  const dispatch = useDispatch();
  const searchTerm = propSearchTerm || ""; // Use prop or fallback to empty string
  const searchResults = useSelector((state: RootState) => state.document.searchResults);

  // Perform the search whenever the component mounts or the searchTerm changes
  useEffect(() => {
    // Dispatch the intelligent document search action with the search term
    dispatch(intelligentDocumentSearch(searchTerm));
  }, [dispatch, searchTerm]);

  const handleSearch = (event) => {
    const newSearchTerm = event.target.value;
    // Dispatch the searchDocuments action with the new term
    dispatch(searchDocuments(newSearchTerm));
    // Optionally, you can also trigger intelligent search
    dispatch(intelligentDocumentSearch(newSearchTerm));
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search documents..."
      />
      <div>
        <h3>Search Results:</h3>
        <ul>
          {searchResults.map((doc) => (
            <li key={doc.id}>{doc.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DocumentSearch;
