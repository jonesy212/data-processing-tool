// chat/ChatSlice.ts
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Channel } from '../../../interfaces/chat/Channel';
import { User } from '../../../users/User';

interface ChatState {
  users: User[]
  messages: Message[];
  channels: Channel[];
  currentChannelId: string | null;
}

const initialState: ChatState = {
  users: [],
  messages: [],
  channels: [],
  currentChannelId: null,
};

const chatManagerSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChannels: (state, action: PayloadAction<Channel[]>) => {
      state.channels = action.payload;
    },
    setCurrentChannelId: (state, action: PayloadAction<string | null>) => {
      state.currentChannelId = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    // Add other chat-related actions as needed
  },
});

export const {
  setChannels,
  setCurrentChannelId,
  setMessages,
  addMessage,
  // Export other chat-related actions
} = chatManagerSlice.actions;

export default chatManagerSlice.reducer;
