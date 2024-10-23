// chat/ChatSlice.ts
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Channel } from "../../../interfaces/chat/Channel";
import { User } from "../../../users/User";
import { WritableDraft } from "../ReducerGenerator";
import { AllTypes } from "@/app/components/typings/PropTypes";

interface ChatState {
  users: User[];
  messages: Message[];
  channels: Channel[];
  currentChannelId: string | null;
  onlineUsers: User[];
  notifications: NotificationData[];
  // Additional communication properties
  audioEnabled: boolean;
  videoEnabled: boolean;
  textEnabled: boolean;
  collaborationEnabled: boolean;
  // Additional project management properties
  phases: string[];
  activePhase: string | null;
}

const initialState: ChatState = {
  users: [],
  messages: [],
  channels: [],
  currentChannelId: null,
  onlineUsers: [],
  notifications: [],
  // Initial values for the new properties
  audioEnabled: true,
  videoEnabled: true,
  textEnabled: true,
  collaborationEnabled: true,
  phases: [],
  activePhase: null,
};

const chatManagerSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
    },
    setCurrentChannelId: (state, action: PayloadAction<string | null>) => {
      state.currentChannelId = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<(prevMessages: WritableDraft<Message>[]) => WritableDraft<Message>[]>
    ) => {
      const { payload } = action;
      state.messages = payload(state.messages).map((message) => ({
        ...message,
        sender: message.sender && {
          ...message.sender,
          data: message.sender.data && {
            ...message.sender.data,
            projects: message.sender.data.projects?.map((project) => ({
              ...project,
              tasks: project.tasks.map((task) => ({
                ...task,
                type: task.type as AllTypes,
              })),
            })),
          },
        },
      }));
    },
    addMessage: (state, action: PayloadAction<WritableDraft<Message>>) => {
      state.messages.push(action.payload);
    },
    // Define reducers for the new properties
    setOnlineUsers: (state, action: PayloadAction<User[]>) => {
      state.onlineUsers = action.payload;
    },
    addNotification: (state, action: PayloadAction<WritableDraft<NotificationData>>) => {
      state.notifications.push(action.payload);
    },
    // Additional reducers for communication properties
    setAudioEnabled: (state, action: PayloadAction<boolean>) => {
      state.audioEnabled = action.payload;
    },
    setVideoEnabled: (state, action: PayloadAction<boolean>) => {
      state.videoEnabled = action.payload;
    },
    setTextEnabled: (state, action: PayloadAction<boolean>) => {
      state.textEnabled = action.payload;
    },
    setCollaborationEnabled: (state, action: PayloadAction<boolean>) => {
      state.collaborationEnabled = action.payload;
    },
    // Additional reducers for project management properties
    setPhases: (state, action: PayloadAction<string[]>) => {
      state.phases = action.payload;
    },
    setActivePhase: (state, action: PayloadAction<string | null>) => {
      state.activePhase = action.payload;
    },
    // Add other chat-related actions as needed
  },
});

export const {
  setChannels,
  setCurrentChannelId,
  setMessages,
  addMessage,
  setOnlineUsers,
  addNotification,
  // Additional actions for communication properties
  setAudioEnabled,
  setVideoEnabled,
  setTextEnabled,
  setCollaborationEnabled,
  // Additional actions for project management properties
  setPhases,
  setActivePhase,
  // Export other chat-related actions
} = chatManagerSlice.actions;

export default chatManagerSlice.reducer;
