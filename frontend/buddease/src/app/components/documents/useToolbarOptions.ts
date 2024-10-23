import { useState } from "react";
import { ToolbarOptions } from "./Toolbar";

// Custom hook to manage toolbar options
const useToolbarOptions = (initialOptions: ToolbarOptions): [ToolbarOptions, (newOptions: ToolbarOptions) => void] => {
  // State to store the toolbar options
  const [toolbarOptions, setToolbarOptions] = useState(initialOptions);

  // Function to update toolbar options
  const updateToolbarOptions = (newOptions: ToolbarOptions) => {
    setToolbarOptions(newOptions);
  };

  // Return toolbar options and function to update them
  return [toolbarOptions, updateToolbarOptions];
};

export default useToolbarOptions;
