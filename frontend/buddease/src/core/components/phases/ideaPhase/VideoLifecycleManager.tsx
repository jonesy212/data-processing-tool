VideoLifecycleManager.tsx
import { useVideoLifecycle } from "@/core/hooks/useVideoLifecycle";
import React, { useEffect } from "react";
import useVideoStore from "../store/useVideoStore";

const VideoLifecycleManager: React.FC = () => {
  const videoStore = useVideoStore();
  const {
    currentPhase,
    isTransitioning,
    getNextPossiblePhases,
    transitionTo,
    moveToNextPhase,
    isUploadPhase,
    isProcessingPhase,
    isReviewPhase,
    isPublishedPhase,
    isArchivedPhase,
  } = useVideoLifecycle();

  // Keep UI in sync with store-level video data
  useEffect(() => {
    if (videoStore.video?.lifecyclePhase && !isTransitioning) {
      const storedPhase = videoStore.video.lifecyclePhase;
      if (storedPhase !== currentPhase?.name) {
        transitionTo(storedPhase);
      }
    }
  }, [videoStore.video?.lifecyclePhase]);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-2">🎬 Video Lifecycle Manager</h2>
      <p>
        Current Phase:{" "}
        <strong>{currentPhase ? currentPhase.name : "Not Started"}</strong>
      </p>

      <div className="mt-4 space-x-2">
        {getNextPossiblePhases().map((phase) => (
          <button
            key={phase.name}
            disabled={isTransitioning}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => transitionTo(phase.name)}
          >
            Move to {phase.name}
          </button>
        ))}

        <button
          disabled={isTransitioning}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={moveToNextPhase}
        >
          Move to Next Phase
        </button>
      </div>

      <div className="mt-4 text-gray-600 text-sm">
        {isUploadPhase && "📤 Uploading video..."}
        {isProcessingPhase && "⚙️ Processing video..."}
        {isReviewPhase && "🧾 Awaiting review..."}
        {isPublishedPhase && "✅ Published successfully!"}
        {isArchivedPhase && "📦 Archived"}
      </div>

      {videoStore.video && (
        <div className="mt-4 border-t pt-3 text-sm text-gray-700">
          <p>Video ID: {videoStore.video.id}</p>
          <p>Title: {videoStore.video.title}</p>
          <p>Lifecycle Phase: {videoStore.video.lifecyclePhase}</p>
          <p>Last Updated: {videoStore.video.lastUpdated}</p>
        </div>
      )}
    </div>
  );
};

export default VideoLifecycleManager;
