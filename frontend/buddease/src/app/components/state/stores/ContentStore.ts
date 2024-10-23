// ContentStore.ts
import { DetailsItemCommon } from "@/app/generators/ListGenerator";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { ContentItem } from "../../models/content/ContentItem";
import { Data } from "../../models/data/Data";




export interface ContentManagementStore {
  contentItems: ContentItem[];
  addContentItem: (contentItem: ContentItem) => void;
  selectedContentItemId: DetailsItemCommon<Data> | null; // Update type here
  updateContentItem: (id: string, updatedContentItem: ContentItem) => void;
  deleteContentItem: (id: string) => void;
  getContentItemById: (id: string) => ContentItem | undefined;
  clearAllContentItems: () => void;
  setSelectedContentItemId: (id: DetailsItemCommon<Data> | null) => void; // Update type here
}

const useContentManagementStore = (): ContentManagementStore => {
  const [contentItems, setContentItems] = useState<(ContentItem | SnapshotContent<any, any>)[]>([]);
 
  const [selectedContentItemId, setSelectedContentItemId] = useState<
  DetailsItemCommon<Data> | null
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
export type { ContentItem };
