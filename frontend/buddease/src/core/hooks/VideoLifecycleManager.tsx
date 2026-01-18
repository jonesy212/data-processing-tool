// VideoLifecycleManager.tsx
import { useVideoLifecycle } from "@/core/hooks/useVideoLifecycle";
import React from "react";

const VideoLifecycleManager: React.FC = () => {
  const {
    currentPhase,
    isTransitioning,
    getNextPossiblePhases,
    transitionTo,
    moveToNextPhase,
    isUploadPhase,
    isProcessingPhase,
  } = useVideoLifecycle();

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
        {isUploadPhase && "Video is being uploaded..."}
        {isProcessingPhase && "Video is being processed..."}
      </div>
    </div>
  );
};

export default VideoLifecycleManager;
