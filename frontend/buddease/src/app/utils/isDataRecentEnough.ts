import { EventData } from "../components/state/stores/AssignEventStore";

// isDataRecentEnough.ts
const isDataRecentEnough = (
  dataItems: EventData[],
  threshold: number
): boolean => {
  // Check if there are no data items or if the threshold is not provided
  if (dataItems.length === 0 || threshold <= 0) {
    return false;
  }

  // Get the current time in milliseconds
  const currentTime = Date.now();

  // Iterate through each data item to compare its timestamp with the current time
  for (const item of dataItems) {
    // Calculate the time difference between the current time and the item's timestamp
    if (typeof item.timestamp === 'number') {
      const timeDifference = currentTime - item.timestamp;
      // Check if the time difference is within the threshold
      if (timeDifference <= threshold) {
        return true; // Data is recent enough
      }
    }
  }

  return false; // Data is not recent enough
};


export { isDataRecentEnough };

