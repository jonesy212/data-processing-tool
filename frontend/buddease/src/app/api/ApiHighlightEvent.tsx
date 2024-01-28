// HighlightEventApi.tsx
import HighlightEvent from '../components/documents/screenFunctionality/HighlightEvent';
import { addData, fetchData, removeData, updateData } from './ApiData';
import { endpoints } from './ApiEndpoints';

const BASE_URL = 'https://your-api-base-url'; // Replace with your actual API base URL
const HIGHLIGHTS_ENDPOINT = 'highlights';

export const createHighlightEvent = async (highlight: Omit<HighlightEvent, 'id'>): Promise<void> => {
  await addData(endpoints.data.addData, highlight);
};

export const getHighlightEvents = async (): Promise<HighlightEvent[]> => {
  const highlightEvents = await fetchData(endpoints.data.getData);
  return highlightEvents as HighlightEvent[];
};

export const updateHighlightEvent = async (highlight: HighlightEvent): Promise<void> => {
  await updateData(endpoints.data.updateData(highlight.id), highlight);
};

export const deleteHighlightEvent = async (highlightId: number): Promise<void> => {
  await removeData(endpoints.data.deleteData(highlightId));
};

// Additional Endpoints
export const processData = async (): Promise<void> => {
  await fetchData(endpoints.data.dataProcessing);
};

export const updateDataTitle = async (): Promise<void> => {
  await fetchData(endpoints.data.updateDataTitle);
};

export const streamData = async (): Promise<void> => {
  await fetchData(endpoints.data.streamData);
};

export const getSpecificData = async (dataId: number): Promise<void> => {
  await fetchData(endpoints.data.getSpecificData(dataId));
};

// Highlight Event API
export const HighlightEventApi = {
  fetchHighlights: async (): Promise<HighlightEvent[]> => {
    try {
      const response = await fetchData(endpoints.data.list);
      return response.data.highlights;
    } catch (error) {
      console.error('Error fetching highlights:', error);
      throw error;
    }
  },

  addHighlight: async (newHighlight: Omit<HighlightEvent, 'id'>) => {
    try {
      const response = await fetchData(endpoints.data.addData, {
        method: 'POST',
        body: JSON.stringify(newHighlight),
      });

      if (response.status === 200 || response.status === 201) {
        const createdHighlight: HighlightEvent = response.data;
        return createdHighlight;
      } else {
        console.error('Failed to add highlight:', response.statusText);
        throw new Error(`Failed to add highlight: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding highlight:', error);
      throw error;
    }
  },

  getSpecificHighlight: async (highlightId: number): Promise<HighlightEvent> => {
    try {
      const response = await fetchData(endpoints.data.getSpecificData(highlightId));
      return response.data.highlight;
    } catch (error) {
      console.error('Error fetching specific highlight:', error);
      throw error;
    }
  },

  updateHighlight: async (highlightId: number, newTitle: string): Promise<HighlightEvent> => {
    try {
      const response = await fetchData(endpoints.data.updateDataTitle, {
        method: 'PUT',
        body: JSON.stringify({ title: newTitle }),
      });

      return response.data;
    } catch (error) {
      console.error('Error updating highlight:', error);
      throw error;
    }
  },

  deleteHighlight: async (highlightId: number): Promise<void> => {
    try {
      await fetchData(endpoints.data.deleteData(highlightId), { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting highlight:', error);
      throw error;
    }
  },
  // Highlight Event API
};
