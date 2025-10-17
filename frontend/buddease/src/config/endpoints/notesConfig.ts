// notesConfig.ts
import { NotesEndpoints } from '@/app/typings/categories/NotesEndpoints';

export const notesConfig: NotesEndpoints = {
  list: { path: "/notes", method: "GET" },
  single: (notesId: number) => ({ path: `/note/${notesId}`, method: "GET" }),
};