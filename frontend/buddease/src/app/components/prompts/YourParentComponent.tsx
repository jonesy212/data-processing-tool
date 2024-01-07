import React, { useState } from "react";
import PromptComponent from "./PromptComponent";

const YourParentComponent: React.FC = () => {
  // Define interface for PromptPageProps
  interface PromptPageProps {
    title: string;
    description: string;
    prompts: {
      id: string;
      text: string;
      type: string;
    }[];
  }

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

  const handleNextPage = () => {
    // Increment the page number
    const nextPage = currentPage + 1;

    // Check if there is a next page
    if (nextPage < promptPages.length) {
      // Set the next page
      setCurrentPage(nextPage);
    } else {
      // Optionally, handle the case where there are no more pages
      console.log("No more pages available");
    }
  };

  const handlePreviousPage = () => {
    // Decrement the page number
    const previousPage = currentPage - 1;

    // Check if there is a previous page
    if (previousPage >= 0) {
      // Set the previous page
      setCurrentPage(previousPage);
    } else {
      // Optionally, handle the case where there are no previous pages
      console.log("Already on the first page");
    }
  };

  return (
    <div>
      <PromptComponent
        currentPage={promptPages[currentPage]}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        title={""}
        description={""}
      />
    </div>
  );
};

export default YourParentComponent;
