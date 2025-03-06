import { useState } from 'react';

const useStoreGenerator = (initialState: any, context: any) => {
  const [state, setState] = useState(initialState);

  const generateStore = (config: { [key: string]: any }) => {
    // Your store generation logic here
    const actions = {
      // Define your actions here
      // Example:
      increment: () => {
        setState((prev:any) => ({ ...prev, count: prev.count + 1 }));
      },
      decrement: () => {
        setState((prev: any) => ({ ...prev, count: prev.count - 1 }));
      },
      // Add more actions as needed
    };

    const selectors = {
      // Define your selectors here
      // Example:
      getCount: () => state.count,
      // Add more selectors as needed
    };

    return {
      // Expose the state
      state,
      // Expose actions to update the state
      actions,
      // Expose selectors to retrieve specific data from the state
      selectors,
    };
  };

  return { generateStore };
};

export default useStoreGenerator;
