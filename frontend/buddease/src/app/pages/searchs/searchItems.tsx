import useAsyncHookLinker, {
  AsyncHookLinkerConfig,
} from "@/app/components/hooks/useAsyncHookLinker";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import SearchResultItem from "@/app/components/models/data/SearchResultItem";
import { useEffect, useState } from "react";
import { SearchLogger } from "../../components/logging/Logger";
import { debounce } from "./Debounce";
import React from "react";

export interface SearchItemProps {
  userId: string;
  query: string;
  toLowerCase?: () => string;
}

const SearchItems: React.FC<SearchItemProps> = ({
  query,
  userId,
}: {
  query: string;
  userId: string;
}) => {
  const { error: searchError, handleError: handleSearchError } =
    useErrorHandling(); // Initialize the useErrorHandling hook
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const searchItems = async (query: string): Promise<any> => {
    setIsLoading(true); // Set loading state to true
    try {
      const response = await fetch(
        `https://example.com/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        SearchLogger.logError("Failed to fetch search results", query);
        throw new Error("Failed to fetch search results");
      }
      const responseData = await response.json();
      setData(responseData); // Set data state with the response data
    } catch (error: any) {
      console.error("Error fetching search results:", error);
      handleSearchError(error.message); // Handle error using the useErrorHandling hook
    } finally {
      setIsLoading(false); // Set loading state to false after fetching
    }
  };

  const debouncedSearchItems = debounce(searchItems, 300);

  const useSearchEffect = (callback: (query: string) => void) => {
    useEffect(() => {
      const inputElement: HTMLInputElement | null =
        document.querySelector("#myInput");
      const handler = async (event: Event) => {
        const query = (event.target as HTMLInputElement)?.value;
        callback(query);
      };
      if (inputElement) {
        inputElement.addEventListener("input", handler);
        return () => {
          inputElement.removeEventListener("input", handler);
        };
      }
    }, [callback]);
  };

  const searchEffectCallback = async (query: string) => {
    debouncedSearchItems(query);
    const asyncHookConfig: AsyncHookLinkerConfig = {
      hooks: [
        {
          enable: () => {},
          disable: () => {},
          condition: () => true,
          idleTimeoutId: null,
          startIdleTimeout: (timeoutDuration, onTimeout) => {},
          asyncEffect: async ({ idleTimeoutId, startIdleTimeout }) => {
            await searchItems(query);
            return () => {
              //todo - implement asyncEffect return cleanup
              // // Close audio/video connections
              // closeAudioVideoConnections();
              // // Save project data to the database
              // saveProjectData();
              // // Clear any temporary files or resources
              // clearTemporaryResources();
              // // Additional cleanup tasks:
              // // 1. Close WebSocket connections
              // closeWebSocketConnections();
              // // 2. Clear local storage
              // clearLocalStorage();
              // // 3. Cancel pending fetch requests
              // cancelPendingFetchRequests();
              // // 4. Reset form fields
              // resetFormFields();
              // // 5. Dispose of event listeners
              // disposeEventListeners();
              // // 6. Stop ongoing animations
              // stopAnimations();
              // // 7. Unload large assets
              // unloadLargeAssets();
              // // 8. Close database connections
              // closeDatabaseConnections();
              // // 9. Release resources used for caching
              // releaseCachingResources();
              // // 10. Dispose of any active timers or intervals
              // disposeTimersAndIntervals();
            };
          },
        },
      ],
    };
    const { moveToNextHook } = useAsyncHookLinker(asyncHookConfig);
    moveToNextHook();
  };

  useSearchEffect(searchEffectCallback);

  // Render loading, error, and data states as needed
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (searchError) {
    // Use the error from useErrorHandling hook
    return <div>Error: {searchError}</div>;
  }

  // Process and display search results
  if (data) {
    return (
      <div>
        {data.map((item: any, index: number) => (
          <SearchResultItem
            items={data}
            key={index}
            id={item.id}
            title={item.title}
            description={item.description}
            source={item.source}
            result={item}
          />
        ))}
      </div>
    );
  }

  return null;
};

export default SearchItems;
