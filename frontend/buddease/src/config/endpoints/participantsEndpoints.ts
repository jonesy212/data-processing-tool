import { ParticipantsEndpoints } from '../types/categories/ParticipantsEndpoints';

export const participantsConfig: ParticipantsEndpoints = {
  single: (userId: string | number) => ({ path: `/api/participants/${userId}`, method: "GET" }),
};