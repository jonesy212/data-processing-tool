// clearDraftMessages.ts

/**
 * Clears draft messages for the given roomId.
 * @param roomId - The ID of the chat room.
 */
const clearDraftMessages = (roomId: string): void => {
    // Implementation to clear draft messages for the given roomId
    const draftMessagesKey = `draftMessages_${roomId}`;
    localStorage.removeItem(draftMessagesKey);
};

export default clearDraftMessages;
