import ErrorBoundary from "@/app/shared/ErrorBoundary";
import React, { useEffect, useState } from "react";
import { useDynamicComponents } from "../../DynamicComponentsContext";
import { Task } from "../../models/tasks/Task";
import LoadingSpinner from "../../models/tracker/LoadingSpinner";
import { Todo } from "../../todos/Todo";
import DynamicTable from "../../documents/DynamicTable";
import DynamicEventHandlerService from "../../event/DynamicEventHandlerExample";

interface DynamicRendererProps {
  handleTodoClick?: (todoId: Todo) => void;
  handleTaskClick?: (taskId: Task) => void;
  handleDynamicAction1?: () => void;
  handleDynamicAction2?: () => void;
  dynamicContent: any[]; // Assuming dynamicContent is an array of objects

}


const DynamicRenderer: React.FC<DynamicRendererProps> = ({
  handleTodoClick,
  handleTaskClick,
  handleDynamicAction1,
  handleDynamicAction2,
  dynamicContent
  
}) => {
  const { hooks, utilities, componentSpecificData, ...otherProps } =
    useDynamicComponents();

  // Destructure otherProps
  const {
    dynamicConfig,
    // dynamicContent,
    setDynamicConfig,
    updateDynamicConfig,
    setDynamicConfigAction,
  } = otherProps;

  // State for loading state
  const [loading, setLoading] = useState(false);

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Example: Fetch dynamic content based on dynamicConfig
    const fetchDynamicContent = async () => {
      try {
        setLoading(true);
        // Perform async operations here, e.g., fetching data based on dynamicConfig
        // Simulating async operation
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate loading delay
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        setError(error.message);
      }
    };

    fetchDynamicContent();
  }, [dynamicConfig]);

  return (
    <div>
      <h2>Dynamic Renderer</h2>
      <ErrorBoundary>
        {loading && <LoadingSpinner loading={loading} />}{" "}
        {/* Show loading spinner while fetching data */}
        {error && <div>Error: {error}</div>}{" "}
        {/* Show error message if fetch fails */}
        {!loading && !error && (
          <div>
            {/* Render content based on dynamicContent */}
            <div>
            {/* Render dynamic content here */}
            {dynamicContent && <DynamicTable data={dynamicContent} />}
          </div>
            {/* Additional features can be added here */}
          </div>
        )}
         {/* Render content based on dynamicContent */}
         {dynamicContent && (
              <div>
                <h3>Dynamic Content</h3>
                {/* Render dynamic content here */}
                <DynamicEventHandlerService
                  handleSorting={() => {
                    // handle sorting logic
                    // You can implement sorting logic here or pass a function from outside
              }}
              
            />
            
              </div>
            )}
      </ErrorBoundary>
    </div>
  );
};

export default DynamicRenderer;
