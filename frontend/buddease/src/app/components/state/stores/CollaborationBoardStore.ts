// CollaborationBoardStore.ts
interface BoardItem {
    id: string;
    title: string;
    description: string;
    // Add other properties as needed
  }
  
  interface CollaborationBoardStore {
    boardItems: BoardItem[];
    addBoardItem: (item: BoardItem) => void;
    removeBoardItem: (itemId: string) => void;
    updateBoardItem: (itemId: string, updatedItem: Partial<BoardItem>) => void;
  }
  
  const initialBoardItems: BoardItem[] = []; // Initial empty array of board items
  
  const collaborationBoardStore: CollaborationBoardStore = {
    boardItems: initialBoardItems,
    addBoardItem: (item) => {
      // Add a new board item to the store
      collaborationBoardStore.boardItems.push(item);
    },
    removeBoardItem: (itemId) => {
      // Remove a board item from the store by its ID
      collaborationBoardStore.boardItems = collaborationBoardStore.boardItems.filter((item) => item.id !== itemId);
    },
    updateBoardItem: (itemId, updatedItem) => {
      // Update a board item in the store by its ID with new properties
      collaborationBoardStore.boardItems = collaborationBoardStore.boardItems.map((item) =>
        item.id === itemId ? { ...item, ...updatedItem } : item
      );
    },
  };
  
  export default collaborationBoardStore;
  export type {CollaborationBoardStore, BoardItem}