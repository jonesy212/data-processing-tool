// SearchResult.tsx
import { searchDocumentAPI } from '@/app/api/ApiDocument'; // Import the searchDocumentAPI method
import SearchResultItem from '@/app/components/models/data/SearchResultItem';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { DocumentData } from '@/app/documents/DocumentBuilder';
import { DocumentOptions } from '@/app/documents/DocumentOptions';
import ListGenerator from '@/app/generators/ListGenerator';
import FolderData from '@/app/models/data/FolderData';
import SearchHistory from '@/app/versions/SearchHistory';
import Version from '@/app/versions/Version';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Entity } from '@/routing/FuzzyMatch';
import * as React from 'react';
import { useEffect, useState } from 'react';


// Define the SearchResultWithQuery interface that extends SearchResult
interface SearchResultWithQuery<T> extends SearchResult<T> {
  query: string;
  searchResults?: SearchResultWithQuery<T>[];
  // [Symbol.iterator](): IterableIterator<T>
}

// Define the SearchResultProps interface for SearchResultComponent
interface SearchResultProps<T> {
  result: SearchResultWithQuery<T>;
}


interface SearchResult<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Entity, DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  items: T[];
  totalCount: number;
  id: number;
  title: string;
  description: string;
  source: string;
  content: string;
  topics: string[];
  highlights:  Highlight[];
  keywords: string[];
  folders: FolderData[];
  options: DocumentOptions;
  folderPath: string | null;
  previousMetadata: any;
  currentMetadata: any;
  accessHistory: any[];
  lastModifiedDate: Date;
  searchHistory: SearchHistory[];
  version?: Version;
  load?: (content: any) => void;
  query: string;
  results: SearchResult<any>[];

  // todo set up using for devs
  repoName?: string;
  repoURL?: string
}


const SearchResultComponent: React.FC<SearchResultProps<any>> = ({ result }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]); // State to store search results
  const [loading, setLoading] = useState(false); // State to track loading status
  const [error, setError] = useState(""); // State to track errors

  useEffect(() => {
    // Perform search on component mount
    performSearch();
  }, []); // Empty dependency array to run effect only once on mount

  const performSearch = async () => {
    try {
      setLoading(true); // Set loading to true while fetching search results
      const results = await searchDocumentAPI("your_search_query_here"); // Replace "your_search_query_here" with the actual search query
      setSearchResults(results); // Update searchResults state with the fetched results
      setLoading(false); // Set loading to false after fetching
    } catch (error) {
      setError("Failed to fetch search results. Please try again."); // Set error message if search fails
      setLoading(false); // Set loading to false in case of error
    }
  };

  return (
    <div className="search-results">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {/* Display search results */}
      {searchResults.map((result, index) => (
        <div key={index}>
          {/* Check if items exist and if there are multiple items */}
          {result.items && result.items.length > 1 ? (
            // If there are multiple items, render a list
            <ListGenerator items={result.items} />
          ) : (
            // If there is only one item, render its details using SearchResultItem
            <SearchResultItem
              key={item.id} 
              items={result.items}
              id={result.id}
              title={result.title}
              description={result.description}
              source={result.source}
              result={result}
              isGlobal={result.isGlobal} 
              createdAt={result.createdAt}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchResultComponent;
export type { SearchResult, SearchResultProps, SearchResultWithQuery };

