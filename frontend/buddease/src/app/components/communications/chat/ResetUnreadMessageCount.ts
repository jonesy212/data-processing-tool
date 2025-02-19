// Assume you have a state or some mechanism to store unread message counts
const unreadMessageCounts: Record<string, number> = {};

const resetUnreadMessageCount = (roomId: string) => {
  // Check if the room exists in the counts
  if (unreadMessageCounts[roomId] !== undefined) {
    // Reset the count
    unreadMessageCounts[roomId] = 0;

    // You might want to notify the server about the reset
    // For example, send an API request to update the unread count on the server

    console.log(`Unread message count for room ${roomId} has been reset.`);
  } else {
    console.warn(`Room ${roomId} not found in unread message counts.`);
  }
};

export default resetUnreadMessageCount;
