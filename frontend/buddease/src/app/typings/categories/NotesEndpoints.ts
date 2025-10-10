import { EndpointConfig } from '../EndpointConfigurations';

export interface NotesEndpoints {
  list: EndpointConfig;
  single: (noteId: number) => EndpointConfig;
}