// searchItems.ts

import { debounce } from "./Debounce";

const inputElement: HTMLInputElement | null =
  document.querySelector("#myInput");

const searchItems = async (query: string) => {
  // Function to fetch search results from the server...
};


// Debounced version of the searchItems function
const debouncedSearchItems = debounce(searchItems, 300);

if (inputElement) {
    inputElement.addEventListener("input", async (event) => {
        const query = (event.target as HTMLInputElement)?.value; // Use optional chaining for safe access
        // Execute debounced search function
        debouncedSearchItems(query);
  
        // Utilize the dynamic hook for managing processes
        const { isLoading, error, data } = useAsyncHook(async () => {
            // Perform asynchronous search operation
            const searchResponse = await searchItems(query);
            return searchResponse;
        });
  
        // Handle loading state
        if (isLoading) {
            // Display loading indicator or perform loading-related tasks
        }
  
        // Handle error state
        if (error) {
            // Handle error, display error message, or perform error-related tasks
        }
  
        // Handle data state
        if (data) {
            // Process and display search results
        }
    
        // Debounced version of the searchItems function
        const debouncedSearchItems = debounce(searchItems, 300);
        if (inputElement) {
            inputElement.addEventListener("input", (event) => {
                const query = (event.target as HTMLInputElement)?.value; // Optional chaining
                // Execute debounced search function
                debouncedSearchItems(query || ''); // Provide a default value if query is null or undefined
            });
        }
    })
}
