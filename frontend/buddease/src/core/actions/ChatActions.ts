// ChatActions.ts
import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
import type { ChatRoom } from '@/core/communications/ChatRoom';
import type { Message } from "@/core/generators/GenerateChatInterfaces";
import type { WritableDraft } from "@/core/state/redux/ReducerGenerator";
import { createAction } from "@reduxjs/toolkit";

export const ChatActions = {
  // Actions for sending messages

  sendMessage: createAction<{
    senderName: string;
    message: string;
    roomId: string;
  }>("sendMessage"),
  sendMessageRequest: createAction<Message<any, any, any, any, any, any>>("sendMessageRequest"),
  sendMessageSuccess: createAction<Message<any, any, any, any, any, any>>("sendMessageSuccess"),
  sendMessageFailure: createAction<{ error: string }>("sendMessageFailure"),

  sendMessageToChatRoom: createAction<{
    chatRoomId?: string;
    room_id?: string
    payload: {
      type: string;
    calendarEvent?: WritableDraft<CalendarEvent<any, any, any, any, any, any>>;
    text?: string;
    calendarEventId?: string;
    }
  }>("sendMessageToChatRoom"),
  // Actions for joining chat room
  joinChatRoomRequest: createAction<ChatRoom>("joinChatRoomRequest"),
  joinChatRoomSuccess: createAction<ChatRoom>("joinChatRoomSuccess"),
  joinChatRoomFailure: createAction<{ error: string }>("joinChatRoomFailure"),

  // Actions for leaving chat room
  leaveChatRoomRequest: createAction<ChatRoom>("leaveChatRoomRequest"),
  leaveChatRoomSuccess: createAction<ChatRoom>("leaveChatRoomSuccess"),
  leaveChatRoomFailure: createAction<{ error: string }>("leaveChatRoomFailure"),

  // Actions for fetching chat history
  fetchChatHistoryRequest: createAction<ChatRoom>("fetchChatHistoryRequest"),
  fetchChatHistorySuccess: createAction<Message<any, any, any, any, any, any>[]>("fetchChatHistorySuccess"),
  fetchChatHistoryFailure: createAction<{ error: string }>(
    "fetchChatHistoryFailure"
  ),

  // Additional actions
  updateChatRoomDetails: createAction<Partial<ChatRoom>>(
    "updateChatRoomDetails"
  ),
  markMessageAsRead: createAction<string>("markMessageAsRead"),

  // Action to discuss calendar event in a chat room
  discussCalendarEventInChatRoomRequest: createAction<{
    eventId: string;
    chatRoomId: string;
    chatRoom: ChatRoom;
  }>("discussCalendarEventInChatRoomRequest"),

  // Action to handle successful discussion of calendar event in a chat room
  discussCalendarEventInChatRoomSuccess: createAction<{
    chatRoomId: string;
    message: Message<any, any, any, any, any, any>;
  }>("discussCalendarEventInChatRoomSuccess"),

  // Action to handle failure while discussing calendar event in a chat room
  discussCalendarEventInChatRoomFailure: createAction<{
    chatRoomId: string;
    error: string;
  }>("discussCalendarEventInChatRoomFailure"),

  // Add more actions as needed
};
