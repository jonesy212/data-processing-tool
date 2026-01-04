participantsConfig.ts
import { ParticipantsEndpoints } from '@/core/typings/categories/ParticipantsEndpoints';

export const participantsConfig: ParticipantsEndpoints = {
  single: (userId: string | number) => ({ path: `/api/participants/${userId}`, method: "GET" }),
};