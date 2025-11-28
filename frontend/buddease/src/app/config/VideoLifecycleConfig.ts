// VideoLifecycleConfig.ts
import { LifecycleConfig } from '@/app/hooks/phases/lifecycles'
import { videoLifecyclePhases } from "@/app/hooks/VideoLifecycleHooks";
import { VideoLifecyclePhase } from "@/app/hooks/VideoLifecyclePhase";

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
