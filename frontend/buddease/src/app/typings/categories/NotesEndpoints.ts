import { EndpointConfig } from '@/config/EndpointConfig';

export interface NotesEndpoints {
  list: EndpointConfig;
  single: (noteId: number) => EndpointConfig;
}