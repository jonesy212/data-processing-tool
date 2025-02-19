import { useEffect, useState } from 'react';

// Function to get data from local storage
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    // Get item from local storage
    const item = window.localStorage.getItem(key);
    // Parse stored JSON or return defaultValue if null
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    // Log errors to console
    console.error('Error getting data from local storage:', error);
    return defaultValue;
  }
};

// Function to save app tree data to local storage
const saveAppTreeToLocalStorage = (key: string, appTreeData: any): void => {
  try {
    // Save app tree data to local storage
    window.localStorage.setItem(key, JSON.stringify(appTreeData));
  } catch (error) {
    // Log errors to console
    console.error('Error saving app tree data to local storage:', error);
  }
};

// Function to save data to local storage
const saveToLocalStorage = <T>(key: string, value: T): void => {
  try {
    // Save value to local storage
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Log errors to console
    console.error('Error saving data to local storage:', error);
  }
};

// Custom hook to get data from local storage
const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  // Get initial value from local storage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get item from local storage
      const item = window.localStorage.getItem(key);
      // Parse stored JSON or return initialValue if null
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Return initialValue if error occurs
      console.error('Error getting data from local storage:', error);
      return initialValue;
    }
  });

  // Update local storage when storedValue changes
  const setValue = (value: T): void => {
    try {
      // Allow value to be a function to handle functional updates
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // Log errors to console
      console.error('Error setting data to local storage:', error);
    }
  };

  // Use useEffect to sync local storage and component state
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        // Update component state with stored value from local storage
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error('Error syncing local storage with component state:', error);
    }
  }, [key]); // Trigger effect whenever the key changes

  return [storedValue, setValue];
};

export { useLocalStorage, getFromLocalStorage, saveToLocalStorage, saveAppTreeToLocalStorage };
