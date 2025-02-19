// useSecureSnapshotId.ts
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { sanitizeData } from "../security/SanitizationFunctions";
import { useNavigate } from "react-router-dom";
import {
  fetchSnapshotById,
  addSnapshot,
  saveSnapshotToDatabase, // or any relevant function for adding a snapshot
} from '@/app/api/SnapshotApi'; // Adjust the import path as necessary
import * as snapshotApi from '@/app/api/SnapshotApi';

export const useSecureSnapshotId = () => {
  const [snapshotId, setSnapshotId] = useState<number | null>(null); // Initialize snapshotId as null or number
  const [loadingError, setLoadingError] = useState<string | null>(null); // To handle loading errors
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSnapshotId = async () => {
      if (isLoading) {
        console.log('Loading user authentication status...');
        return; // Early return if still loading
      }

      if (!isAuthenticated || !user) {
        navigate('/login'); // Redirect to login if not authenticated
        return;
      }

      try {
        // Fetch snapshot ID using the user's ID or another identifier
        const fetchedSnapshotId = await snapshotApi.fetchSnapshotById(user.id); // Assuming user.id is used to fetch the snapshot ID

        if (typeof fetchedSnapshotId === "number") {
          // Sanitize and set the snapshot ID
          const sanitizedSnapshotId = sanitizeData(String(fetchedSnapshotId));
          setSnapshotId(Number(sanitizedSnapshotId));
          setLoadingError(null); // Clear any previous errors
        } else {
          throw new Error("Invalid snapshot ID fetched.");
        }
      } catch (error) {
        console.error("Error fetching snapshot ID:", error);
        setLoadingError("Failed to load snapshot ID. Please try again later.");
        navigate('/error'); // Redirect to an error page
      }
    };
    // Set a timeout to handle cases where loading takes too long
    const timer = setTimeout(() => {
      if (isLoading || snapshotId === null) {
        setLoadingError("Loading is taking longer than expected. Please refresh the page.");
        navigate('/error'); // Redirect to an error page or handle as needed
      }
    }, 10000); // 10 seconds timeout, adjust as needed

    // Call fetchSnapshotId and clear the timeout if completed in time
    fetchSnapshotId().finally(() => clearTimeout(timer));

  }, [isLoading, isAuthenticated, user, navigate]);

 
  const handleAddSnapshot = async (newSnapshotData: any) => { // Replace `any` with appropriate type
    try {
      const result = await addSnapshot(newSnapshotData); // Call to add a new snapshot
      console.log("Snapshot added:", result);

      // Save the added snapshot to the database
      const saveResult = await saveSnapshotToDatabase(result); // Save the snapshot data to the database
      console.log("Snapshot saved to database:", saveResult);
      // Optionally, you can update the state or do something with the save result
    } catch (error) {
      console.error("Error adding snapshot:", error);
      setLoadingError("Failed to add snapshot. Please try again later.");
    }
  };

  // Optionally handle different states based on loadingError
  if (loadingError) {
    console.error(loadingError);
    // You could return an error message or component here if needed
  }

  return { snapshotId, handleAddSnapshot }; // Return the snapshotId and the add function
};

export default useSecureSnapshotId;
