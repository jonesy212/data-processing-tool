import { endpoints } from '@/app/api/ApiEndpoints';
import axiosInstance from '../security/csrfToken';
import { useNotification } from '../support/NotificationContext';


const { notify } = useNotification();

const API_BASE_URL = endpoints.toolbar;

export const fetchToolbarItems = async (toolbarId: string): Promise<ToolbarItem[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/${toolbarId}`);
    return response.data.items;
  } catch (error) {
    console.error('Error fetching toolbar items:', error);
    throw error;
  }
};

export const addToolbarItem = async (newItem: Omit<ToolbarItem, 'id'>) => {
  try {
    const response = await axiosInstance.post(API_BASE_URL, newItem);

    if (response.status === 200 || response.status === 201) {
      const createdItem: ToolbarItem = response.data;
      notify('success', 'Toolbar item added successfully');
      // Handle the logic for adding the new item to the toolbar context
    } else {
      console.error('Failed to add toolbar item:', response.statusText);
      notify('error', 'Failed to add toolbar item');
    }
  } catch (error) {
    console.error('Error adding toolbar item:', error);
    notify('error', 'Error adding toolbar item');
    throw error;
  }
};

export const removeToolbarItem = async (itemId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/${itemId}`);
    notify('success', 'Toolbar item removed successfully');
    // Handle the logic for removing the item from the toolbar context
  } catch (error) {
    console.error('Error removing toolbar item:', error);
    notify('error', 'Error removing toolbar item');
    throw error;
  }
};

export const updateToolbarItem = async (itemId: string, newItemData: Partial<ToolbarItem>): Promise<ToolbarItem> => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/${itemId}`, newItemData);
    notify('success', 'Toolbar item updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating toolbar item:', error);
    notify('error', 'Error updating toolbar item');
    throw error;
  }
};

// Add other toolbar-related actions as needed
