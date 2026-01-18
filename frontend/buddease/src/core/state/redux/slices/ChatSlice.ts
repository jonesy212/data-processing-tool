// ChatSlice.ts
chat/ChatSlice.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Message } from "@/core/generators/GenerateChatInterfaces";
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import { Channel } from "@/core/interfaces/chat/Channel";
import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
import { AllTypes } from "@/core/typings/PropTypes";
import {
    AppUser,
    User, UserData
} from "@/core/user/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



interface ChatState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  messages: Message[];
  channels: Channel[];
  currentChannelId: string | null;
  onlineUsers: User<UserData<T, K, Meta>, Meta, ExcludedFields>[];
  notifications: Notification<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  // Additional communication properties
  audioEnabled: boolean;
  videoEnabled: boolean;
  textEnabled: boolean;
  collaborationEnabled: boolean;
  // Additional project management properties
  phases: string[];
  activePhase: string | null;
  users: User<UserData<T, K, Meta>, Meta, ExcludedFields>[];
}

const initialState: ChatState<BaseDataEntity> = {
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
    setOnlineUsers: (state, action: PayloadAction<WritableDraft<AppUser[]>>) => {
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
