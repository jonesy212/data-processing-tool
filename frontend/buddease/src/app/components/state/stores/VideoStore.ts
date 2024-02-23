import { endpoints } from "@/app/api/ApiEndpoints";
import { useNotification } from "@/app/components/support/NotificationContext"; // Import useNotification
import { makeAutoObservable } from "mobx";
import { useState } from "react";
export interface Video {
  id: string;
  title: string;
  description: string;
  // Add more properties as needed
}

export interface VideoStore {
  videos: Record<string, Video>;
  fetchVideos: () => void;
  updateVideo: (id: string, updatedVideo: Video) => void;
  deleteVideo: (id: string) => void;
  // Add more methods as needed
}

export interface Video {
  id: string;
  title: string;
  description: string;
  // Add more properties as needed
}

export interface VideoStore {
  videos: Record<string, Video>;
  fetchVideos: () => void;
  updateVideo: (id: string, updatedVideo: Video) => void;
  deleteVideo: (id: string) => void;
  updateVideoTags: (id: string, newTags: string[]) => void;
  // Add more methods as needed
}

const useVideoStore = (): VideoStore => {
  const [videos, setVideos] = useState<Record<string, Video>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoints.videos.list);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      handleError(error, "fetching videos");
    } finally {
      setIsLoading(false);
    }
  };

  const addVideo = (video: Video) => {
    setVideos((prevVideos) => ({
      ...prevVideos,
      [video.id]: video,
    }));
    notify(
      "Video added successfully",
      "Video added successfully",
      new Date(),
      "OperationSuccess"
    );
  };

  const updateVideo = (id: string, updatedVideo: Video) => {
    setVideos((prevVideos) => ({
      ...prevVideos,
      [id]: updatedVideo,
    }));
    notify(
      "Video updated successfully",
      "Video updated successfully",
      new Date(),
      "OperationSuccess"
    ); // Notify success
  };

  const deleteVideo = (id: string) => {
    setVideos((prevVideos) => {
      const updatedVideos = { ...prevVideos };
      delete updatedVideos[id];
      return updatedVideos;
    });
    notify(
      "Video deleted successfully",
      "Video deleted successfully",
      new Date(),
      "OperationSuccess"
    ); // Notify success
  };

  const handleError = (error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    setError(`Error ${action}: ${error.message || "Unknown error"}`);
    notify(`Error ${action}`, "Failed to perform action", new Date(), "Error");
  };

  const updateVideoTags = async (id: string, tags: string[]) => {
    try {
      const response = await fetch(endpoints.videos.updateVideoTags, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          tags,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update video tags");
      }
      const data = await response.json();
      updateVideo(id, data);
    } catch (error) {
      handleError(error, "updating video tags");
    } finally {
      setIsLoading(false);
    }
  };

  const store: VideoStore = makeAutoObservable({
    videos,
    isLoading,
    error,
    fetchVideos,
    addVideo,
    updateVideo,
    deleteVideo,
    updateVideoTags,
  });

  return store;
};

export default useVideoStore;
