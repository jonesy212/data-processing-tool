import { endpoints } from '@/app/api/ApiEndpoints';
import axiosInstance from '../../security/csrfToken';
import { NotificationType, useNotification } from '../../support/NotificationContext';
import ToolbarItem from '../../documents/ToolbarItem';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';

const { notify } = useNotification();
const API_BASE_URL = endpoints.toolbar;

export const fetchToolbarItems = async (toolbarId: string): Promise<typeof ToolbarItem[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/${toolbarId}`);
    return response.data.items;
  } catch (error) {
    console.error('Error fetching toolbar items:', error);
    notify(
      'error',
      'Error fetching toolbar items',
      NOTIFICATION_MESSAGES.Toolbar.FETCHING_TOOLBAR_ITEMS,
      new Date(),
      "Toolbar" as NotificationType
    );
    throw error;
  }
};

export const addToolbarItem = async (newItem: Omit<typeof ToolbarItem, 'id'>) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}`, newItem);

    if (response.status === 200 || response.status === 201) {
      const createdItem: typeof ToolbarItem = response.data;
      notify(
        'success',
        'Toolbar item added successfully',
        NOTIFICATION_MESSAGES.Toolbar.ADDED_TOOOLBAR_ITEM,
        new Date(),
        "Toolbar" as NotificationType
      );
      // Handle the logic for adding the new item to the toolbar context
      createdItem 
    } else {
      console.error('Failed to add toolbar item:', response.statusText);
      notify(
        'error',
        'Failed to add toolbar item',
        NOTIFICATION_MESSAGES.Toolbar.FAILED_TO_ADD_TOOLBAR_ITEM,
        new Date(),
        "Toolbar" as NotificationType
      );
    }
  } catch (error) {
    console.error('Error adding toolbar item:', error);
    notify(
      'error',
      'Error adding toolbar item',
      NOTIFICATION_MESSAGES.Toolbar.ERROR_ADDING_TOOLBAR_ITEM,
      new Date(),
      "Toolbar" as NotificationType
    );
    throw error;
  }
};

export const removeToolbarItem = async (itemId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/${itemId}`);
    notify(
      'success',
      'Toolbar item removed successfully',
      NOTIFICATION_MESSAGES.Toolbar.REMOVED_TOOLBAR_ITEM,
      new Date(),
      "Toolbar" as NotificationType
    );
    // Handle the logic for removing the item from the toolbar context
  } catch (error) {
    console.error('Error removing toolbar item:', error);
    notify(
      'error',
      'Error removing toolbar item',
      NOTIFICATION_MESSAGES.Toolbar.ERROR_REMOVING_TOOLBAR_ITEM,
      new Date(),
      "Toolbar" as NotificationType
    );
    throw error;
  }
};

export const updateToolbarItem = async (itemId: string, newItemData: Partial<typeof ToolbarItem>): Promise<typeof ToolbarItem> => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/${itemId}`, newItemData);
    notify(
      'success',
      'Toolbar item updated successfully',
      NOTIFICATION_MESSAGES.Toolbar.UPDATED_TOOLBAR_ITEM,
      new Date(),
      "Toolbar" as NotificationType
    );
    return response.data;
  } catch (error) {
    console.error('Error updating toolbar item:', error);
    notify(
      'error',
      'Error updating toolbar item',
      NOTIFICATION_MESSAGES.Toolbar.ERROR_UPDATING_TOOLBAR_ITEM,
      new Date(),
      "Toolbar" as NotificationType
    );
    throw error;
  }
};

// Add other toolbar-related actions as needed
