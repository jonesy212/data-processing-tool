// chat/ChatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Channel } from '../../interfaces/chat/Channel';

interface ChatState {
  channels: Channel[];
  currentChannelId: string | null;
  messages: Message[];
}

const initialState: ChatState = {
  channels: [],
  currentChannelId: null,
  messages: [],
};

const chatSlice = createSlice({
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
} = chatSlice.actions;

export default chatSlice.reducer;
