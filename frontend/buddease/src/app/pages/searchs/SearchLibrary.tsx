import { DocumentData } from '@/app/components/documents/DocumentBuilder';
import useErrorHandling from '@/app/components/hooks/useErrorHandling';
import SearchBar from '@/app/components/routing/SearchBar';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SearchLogger } from '../../components/logging/Logger';
import SearchComponent from './SearchComponent';
import { SearchProvider } from './SearchContext';
import SearchItems, { SearchItemProps } from './SearchItems';
import { SearchActions } from '@/app/components/actions/SearchActions';
import { userService } from '@/app/components/users/ApiUser';

type Search = string;

const SearchLibrary: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>(); // Define userId as optional
  const { error: searchError, handleError: handleSearchError } = useErrorHandling();
  const [searchQuery, setSearchQuery] = useState<Search>("");
  const [documentData, setDocumentData] = useState<DocumentData[]>([]);

  useEffect(() => {
    if (!userId) {
      handleSearchError('User not found');
    } else {
      // Fetch user data
      const fetchUserData = async () => {
        try {
          const user = await userService.fetchUserById(userId);
          // Do something with the user data if needed
          return user
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          handleSearchError(error.message);
        }
      };

      fetchUserData();
    }
  }, [userId, handleSearchError]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    SearchActions.setSearchQuery(query);

    try {
      // Log search action
      SearchLogger.logSearch(userId ?? '', query); // Provide default value if userId is undefined

      // Call SearchItems function to get search results
      const items = SearchItems({ userId: userId ?? '', query }); // Provide default value if userId is undefined
      if (Array.isArray(items)) {
        const filteredData: DocumentData[] = items.filter(
          (item: DocumentData) =>
            item.title.toLowerCase().includes(query.toLowerCase())
        );
        setDocumentData(filteredData);
      } else {
        console.error("SearchItems does not return an array:", items);
        setDocumentData([]); // Set an empty array as default data
      }
    } catch (error: any) {
      // Handle search error
      console.error("Error occurred during search:", error);
      handleSearchError(error.message);
    }
  };

  return (
    <SearchProvider>
      <div>
        <SearchBar onSearch={handleSearch} />
        {searchError ? (
          <div>Error: {searchError}</div>
        ) : (
          <SearchComponent
            searchQuery={searchQuery}
            documentData={documentData}
            componentSpecificData={[
              {
                id: 0,
                title: "",
                description: "",
                source: "",
              },
            ]}
          />
        )}
        <SearchItems query={searchQuery} userId={userId ?? ''} /> // Provide default value if userId is undefined
      </div>
    </SearchProvider>
  );
};

export default SearchLibrary;
