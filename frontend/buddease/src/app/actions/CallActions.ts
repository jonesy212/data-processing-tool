// CallActions.ts
// actions/CallActions.ts
export const START_AUDIO_CALL = 'START_AUDIO_CALL';
export const END_AUDIO_CALL = 'END_AUDIO_CALL';
export const START_VIDEO_CALL = 'START_VIDEO_CALL';
export const END_VIDEO_CALL = 'END_VIDEO_CALL';

export const startAudioCall = (participantIds: string[]) => ({
  type: START_AUDIO_CALL,
  payload: participantIds,
});

export const endAudioCall = (participantIds: string[]) => ({
  type: END_AUDIO_CALL,
  payload: participantIds,
});

export const startVideoCall = (participantIds: string[]) => ({
  type: START_VIDEO_CALL,
  payload: participantIds,
});

export const endVideoCall = (participantIds: string[]) => ({
  type: END_VIDEO_CALL,
  payload: participantIds,
});
