import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useDynamicNavigation = (condition: () => boolean, path: string, direction: "backward" | "forward") => {
  const navigate = useNavigate();

  useEffect(() => {
    if (condition()) {
      navigate(path);
    }
  }, [condition, navigate, path]);

  useEffect(() => {
    try {
      if (condition()) {
        if (direction === "backward") {
          // Implement logic to navigate backward in history
          // For example, you can revert to the previous state or action
          console.log("Navigating backward in history...");
        } else if (direction === "forward") {
          // Implement logic to navigate forward in history
          // For example, you can redo a previously undone action
          console.log("Navigating forward in history...");
        } else {
          throw new Error("Invalid direction for navigating history.");
        }
      }
    } catch (error) {
      console.error("Error navigating history:", error);
      // Handle any errors that occur during navigation
    }
  }, [condition, direction]);
};

export default useDynamicNavigation;
