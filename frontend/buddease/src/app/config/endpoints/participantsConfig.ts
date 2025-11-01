// participantsConfig.ts
import { ParticipantsEndpoints } from '@/app/typings/categories/ParticipantsEndpoints';

export const participantsConfig: ParticipantsEndpoints = {
  single: (userId: string | number) => ({ path: `/api/participants/${userId}`, method: "GET" }),
};