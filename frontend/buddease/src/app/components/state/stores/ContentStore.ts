// ContentStore.ts
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { ContentItem } from "../../models/content/ContentItem";



export interface ContentManagementStore {
  contentItems: ContentItem[];
  addContentItem: (contentItem: ContentItem) => void;
  selectedContentItemId: string | null;

  updateContentItem: (id: string, updatedContentItem: ContentItem) => void;
  deleteContentItem: (id: string) => void;
  getContentItemById: (id: string) => ContentItem | undefined;
  clearAllContentItems: () => void;
  setSelectedContentItemId: (id: string | null) => void;

  // Add more methods as needed
}

const useContentManagementStore = (): ContentManagementStore => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedContentItemId, setSelectedContentItemId] = useState<
    string | null
  >(null);

  const addContentItem = (contentItem: ContentItem) => {
    setContentItems((prevItems) => [...prevItems, contentItem]);
  };

  const updateContentItem = (id: string, updatedContentItem: ContentItem) => {
    setContentItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? updatedContentItem : item))
    );
  };

  const deleteContentItem = (id: string) => {
    setContentItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const getContentItemById = (id: string) => {
    return contentItems.find((item) => item.id === id);
  };

  const clearAllContentItems = () => {
    setContentItems([]);
  };

  const store: ContentManagementStore = makeAutoObservable({
    contentItems,
    addContentItem,
    selectedContentItemId,
    updateContentItem,
    deleteContentItem,
    getContentItemById,
    clearAllContentItems,
    setSelectedContentItemId,
    // Add more methods as needed
  });

  return store;
};

export default useContentManagementStore;
export type {ContentItem}