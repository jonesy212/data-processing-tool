// VideoLifecycleConfig.ts
import { LifecycleConfig } from '@/core/hooks/phases/lifecycles';
import { videoLifecyclePhases } from "@/core/hooks/VideoLifecycleHooks";
import { VideoLifecyclePhase } from "@/core/phases/VideoLifecyclePhase";

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
