import React, { useState } from "react";
import useSearchPagination from "../hooks/commHooks/useSearchPagination";
import useAsyncHookLinker from "../hooks/useAsyncHookLinker";
import PromptComponent from "./PromptComponent";
import { PromptPageProps } from "./PromptPage";

const YourParentComponent: React.FC = () => {
  // Define interface for PromptPageProps

  // Array of prompt pages
  const promptPages: PromptPageProps[] = [
    {
      title: "Page 1",
      description: "Description for Page 1",
      prompts: [
        {
          id: "prompt1",
          text: "Enter your name",
          type: "text",
        },
      ],
    },
    // Add more pages as needed
  ];

  // State to manage the current page index
  const [currentPage, setCurrentPage] = useState<number>(0); // Initialize with the first page

  // Use the useSearchPagination hook to handle pagination
  const { nextPage, previousPage } = useSearchPagination(promptPages.length);
  // Pass the async hook to useAsyncHookLinker
  const { moveToNextHook, moveToPreviousHook } = useAsyncHookLinker({
    hooks: [],
  });

  const handleNextPage = () => {
    nextPage();

    // Move to the next hook after changing the page
    moveToNextHook();
  };

  const handlePreviousPage = () => {
    previousPage();
    // Move to the previous hook after changing the page
    moveToPreviousHook();
  };

  return (
    <div>
      <PromptComponent
        userIdea="Initial idea"
        prompts={promptPages[currentPage].prompts}
        currentPage={promptPages[currentPage]} // Pass the current page object
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        title={promptPages[currentPage].title} // Set title to current page title
        description={promptPages[currentPage].description} // Set description to current page description
      />
    </div>
  );
};

export default YourParentComponent;
