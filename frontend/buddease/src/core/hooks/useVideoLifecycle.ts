useVideoLifecycle.ts
import { videoLifecycleConfig } from "@/core/config/VideoLifecycleConfig";
import { useLifecycle } from "@/core/hooks/useLifecycle.ts";
import { VideoLifecyclePhase } from "@/core/phases/VideoLifecyclePhase";
import useVideoStore from "@/core/state/stores/VideoStore"; // ← connects to your state store
import { useCallback, useEffect } from "react";

export const useVideoLifecycle = () => {
  const videoStore = useVideoStore(); // centralized store
  const {
    currentPhase,
    isTransitioning,
    transitionTo,
    canTransitionTo,
    updateActivity,
    getNextPossiblePhases,
    getPhase,
    getAllPhases,
    getPhaseHistory,
    checkIdleTimeout,
  } = useLifecycle(videoLifecycleConfig);

  /** --- Video-specific lifecycle helpers --- */
  const isUploadPhase = currentPhase?.name === VideoLifecyclePhase.UPLOAD;
  const isProcessingPhase = currentPhase?.name === VideoLifecyclePhase.PROCESSING;
  const isReviewPhase = currentPhase?.name === VideoLifecyclePhase.REVIEW;
  const isPublishedPhase = currentPhase?.name === VideoLifecyclePhase.PUBLISH;
  const isArchivedPhase = currentPhase?.name === VideoLifecyclePhase.ARCHIVED;

  /** Automatically move to the next available phase */
  const moveToNextPhase = useCallback(async (): Promise<boolean> => {
    const next = getNextPossiblePhases()[0];
    if (next) {
      return await transitionTo(next.name);
    }
    return false;
  }, [getNextPossiblePhases, transitionTo]);

  /**
   * Whenever phase changes, sync with the video store
   * so the lifecycle is reflected in persisted state.
   */
  useEffect(() => {
    if (currentPhase && videoStore.video) {
      const updatedVideo = {
        ...videoStore.video,
        lifecyclePhase: currentPhase.name,
        lastUpdated: new Date().toISOString(),
      };
      videoStore.updateVideo(videoStore.video.id, updatedVideo);
    }
  }, [currentPhase, videoStore.video]);

  return {
    currentPhase,
    isTransitioning,
    transitionTo,
    canTransitionTo,
    updateActivity,
    getNextPossiblePhases,
    getPhase,
    getAllPhases,
    getPhaseHistory,
    checkIdleTimeout,
    moveToNextPhase,
    isUploadPhase,
    isProcessingPhase,
    isReviewPhase,
    isPublishedPhase,
    isArchivedPhase,
  };
};
