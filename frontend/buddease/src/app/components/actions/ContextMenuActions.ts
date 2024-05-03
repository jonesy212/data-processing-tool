// ContextMenuActions.ts
import { createAction } from "@reduxjs/toolkit";

export const ContextMenuActions = {
  // Single Context Menu Actions
  showContextMenu: createAction<{
    event: React.MouseEvent<HTMLDivElement>;
    items: {
        label: string;
        action: (selectedText: string) => void; // Adjust the action function to accept selectedText
    }[];
}>("showContextMenu"),

  openContextMenu: createAction<{ x: number; y: number }>("openContextMenu"),
  closeContextMenu: createAction("closeContextMenu"),

  // Additional Context Menu Actions (if needed)
  updateContextMenuItems: createAction<string[]>("updateContextMenuItems"),
  resetContextMenu: createAction("resetContextMenu"),

  
    copyToClipboard: createAction<{ text: string }>("copyToClipboard"),
    shareText: createAction<{ text: string }>("shareText"),
    hideContextMenu: createAction("hideContextMenu"),
};
