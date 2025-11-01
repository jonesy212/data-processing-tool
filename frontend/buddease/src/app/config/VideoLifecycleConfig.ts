// VideoLifecycleConfig.ts
// VideoLifecycleConfig.ts
import { LifecycleConfig } from "../Lifecycle";
import { videoLifecyclePhases } from "./VideoLifecycleHooks";
import { VideoLifecyclePhase } from "./VideoLifecyclePhase";

export const videoLifecycleConfig: LifecycleConfig = {
  phases: videoLifecyclePhases,
  initialPhase: VideoLifecyclePhase.UPLOAD,
  onPhaseChange: (from, to) => {
    console.log(`Phase changed from ${from?.name ?? "none"} → ${to.name}`);
  },
  onTransitionError: (error) => {
    console.error("Video lifecycle transition error:", error);
  },
};
