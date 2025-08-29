// useSecureSnapshotId.ts
import * as snapshotApi from '@/app/api/SnapshotApi';
import {
  addSnapshot,
  saveSnapshotToDatabase
} from '@/app/api/SnapshotApi'; // Adjust the import path as necessary
import { useAuth } from "@/server/auth/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// small helper for cleaning primitive IDs
const sanitizePrimitive = (value: string | number): string | number => {
  if (typeof value === "string") return value.trim();
  return value;
};

export const useSecureSnapshotId = () => {
  const [snapshotId, setSnapshotId] = useState<number | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSnapshotId = async () => {
      if (isLoading) return;
      if (!isAuthenticated || !user) {
        navigate("/login");
        return;
      }

      try {
        // fetch snapshot object by user.id
        const fetchedSnapshot = await snapshotApi.fetchSnapshotById(user.id);

        if (fetchedSnapshot?.id) {
          const sanitizedSnapshotId = sanitizePrimitive(fetchedSnapshot.id);
          setSnapshotId(Number(sanitizedSnapshotId));
          setLoadingError(null);
        } else {
          throw new Error("Invalid snapshot object fetched.");
        }
      } catch (error) {
        console.error("Error fetching snapshot ID:", error);
        setLoadingError("Failed to load snapshot ID. Please try again later.");
        navigate("/error");
      }
    };

    // timeout guard
    const timer = setTimeout(() => {
      if (isLoading || snapshotId === null) {
        setLoadingError(
          "Loading is taking longer than expected. Please refresh the page."
        );
        navigate("/error");
      }
    }, 10000);

    fetchSnapshotId().finally(() => clearTimeout(timer));
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleAddSnapshot = async (newSnapshotData: any) => {
    try {
      const result = await addSnapshot(newSnapshotData);
      console.log("Snapshot added:", result);

      const saveResult = await saveSnapshotToDatabase(result);
      console.log("Snapshot saved to database:", saveResult);
    } catch (error) {
      console.error("Error adding snapshot:", error);
      setLoadingError("Failed to add snapshot. Please try again later.");
    }
  };

  if (loadingError) {
    console.error(loadingError);
  }

  return { snapshotId, handleAddSnapshot };
};


export default useSecureSnapshotId;
