// ListItem.ts
interface ListState {
  items: ListItem[];
  selectedItem: ListItem | null;
  loading: boolean;
  error: string | null;
  // Add more properties as needed
}

interface ListItem {
  id: string;
  name: string;
  description: string;
  // Add more properties as needed
}
export type { ListItem, ListState };

