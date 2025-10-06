import { contentApiService } from './contentApiService'; // (public interface)

// Re-export the service methods as clean functions
export const fetchContentById = contentApiService.fetchContentById.bind(contentApiService);
export const createContent = contentApiService.createContent.bind(contentApiService);
export const updateContent = contentApiService.updateContent.bind(contentApiService);
export const deleteContent = contentApiService.deleteContent.bind(contentApiService);