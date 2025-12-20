// VideoLifecyclePhase.ts
// VideoLifecycleHooks.ts
import { PhaseOptions } from "@/app/hooks/phases/lifecycles";
import { VideoLifecyclePhase } from "./VideoLifecyclePhase";

export enum VideoLifecyclePhase {
  UPLOAD = "upload",
  PROCESSING = "processing",
  REVIEW = "review",
  PUBLISH = "publish",
  ARCHIVED = "archived",
}

export const videoLifecyclePhases: PhaseOptions[] = [
  {
    name: VideoLifecyclePhase.UPLOAD,
    subPhases: ["uploading", "metadata"],
    hooks: {
      canTransitionTo: (next) =>
        [VideoLifecyclePhase.PROCESSING].includes(next.name),
      handleTransitionTo: (next) => {
        console.log(`Preparing video for ${next.name} phase...`);
      },
      condition: async () => true,
    },
  },
  {
    name: VideoLifecyclePhase.PROCESSING,
    subPhases: ["transcoding", "thumbnail-generation"],
    hooks: {
      canTransitionTo: (next) =>
        [VideoLifecyclePhase.REVIEW].includes(next.name),
      handleTransitionTo: (next) => {
        console.log(`Video transcoding completed. Moving to ${next.name}`);
      },
      condition: async () => true,
    },
  },
  {
    name: VideoLifecyclePhase.REVIEW,
    subPhases: ["internal", "external"],
    hooks: {
      canTransitionTo: (next) =>
        [VideoLifecyclePhase.PUBLISH].includes(next.name),
      handleTransitionTo: (next) => {
        console.log(`Video approved for ${next.name}`);
      },
      condition: async () => true,
    },
  },
  {
    name: VideoLifecyclePhase.PUBLISH,
    subPhases: ["public", "private"],
    hooks: {
      canTransitionTo: (next) =>
        [VideoLifecyclePhase.ARCHIVED].includes(next.name),
      handleTransitionTo: () => {
        console.log("Video published successfully!");
      },
      condition: async () => true,
    },
  },
  {
    name: VideoLifecyclePhase.ARCHIVED,
    subPhases: [],
    hooks: {
      canTransitionTo: () => false,
      handleTransitionTo: () => {
        console.log("Video archived.");
      },
      condition: async () => true,
    },
  },
];
