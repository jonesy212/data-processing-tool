// ChatPage.tsx
import RootLayout from "@/app/RootLayout";
import {
  Channel,
  ChannelMember,
  ChannelMessage,
  ChannelRole,
  ChannelType,
} from "@/app/components/interfaces/chat/Channel";
import { User } from "@/app/components/users/User";
import { Message } from "@/app/generators/GenerateChatInterfaces";
import React, { useEffect, useState } from "react";

// Expand the ChatPageProps interface
interface ChatPageProps {
  // Props related to the current user
  currentUser: User;

  // Props related to the current channel
  currentChannel: Channel;

  // List of messages in the current channel
  messages: Message[];

  // Function to send a new message
  sendMessage: (text: string) => void;

  // Function to switch to a different channel
  switchChannel: (channelId: string) => void;

  // Any additional props you may need for the chat page
  // ...

  // Optional props
  optionalProp?: string;
}

const ChatPage: React.FC<ChatPageProps> = (props) => {
  // State to manage the current channel
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  // Dummy data for channels, members, and messages (replace this with actual data)
  const dummyChannels: Channel[] = [
    {
      id: "1",
      name: "General",
      type: ChannelType.Public,
      members: [
        { userId: "user1", username: "User 1", role: ChannelRole.Owner },
        { userId: "user2", username: "User 2", role: ChannelRole.Member },
      ],
      messages: [
        {
          messageId: "1",
          userId: "user1",
          username: "User 1",
          content: "Hello, everyone!",
          timestamp: new Date(),
        },
        {
          messageId: "2",
          userId: "user2",
          username: "User 2",
          content: "Hi User 1!",
          timestamp: new Date(),
        },
      ],
    },
    // Add more channels as needed
  ];

  // Function to switch to a different channel
  const switchChannel = (channelId: string) => {
    const selectedChannel = dummyChannels.find(
      (channel) => channel.id === channelId
    );
    setCurrentChannel(selectedChannel || null);
  };

  useEffect(() => {
    // Initial setup, you may load channels from an API here
    switchChannel("1");
  }, []); // Empty dependency array to run the effect only once on mount

  return (
    <RootLayout>
      <div>
        <h1>Chat Page</h1>
        {/* Render the list of channels */}
        <div>
          <h2>Channels</h2>
          <ul>
            {dummyChannels.map((channel) => (
              <li key={channel.id} onClick={() => switchChannel(channel.id)}>
                {channel.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Render the current channel */}
        {currentChannel && (
          <div>
            <h2>{currentChannel.name}</h2>
            {/* Render the list of channel members */}
            <div>
              <h3>Members</h3>
              <ul>
                {currentChannel.members.map((member: ChannelMember) => (
                  <li key={member.userId}>{member.username}</li>
                ))}
              </ul>
            </div>

            {/* Render the list of channel messages */}
            <div>
              <h3>Messages</h3>
              <ul>
                {currentChannel.messages.map((message: ChannelMessage) => (
                  <li key={message.messageId}>
                    <strong>{message.username}:</strong> {message.content} -{" "}
                    {message.timestamp.toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Display user status */}
        <div>
          <h2>User Status</h2>
          {/* Render user status information */}
        </div>

        {/* Display message timestamps */}
        <div>
          <h2>Message Timestamps</h2>
          <ul>
            {props.messages.map((message) => (
              <li key={message.id}>
                <strong>{message.username}:</strong> {message.content} -{" "}
                {message.timestamp.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>

        {/* Display user status */}
        <div>
          <h2>User Status</h2>
          {/* Render user status information */}
        </div>

        {/* Display message timestamps */}
        <div>
          <h2>Message Timestamps</h2>
          <ul>
            {props.messages.map((message) => (
              <li key={message.id}>
                <strong>{message.username}:</strong> {message.content} -{" "}
                {message.timestamp.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </RootLayout>
  );
};

export default ChatPage;

// explanations
// currentUser: Information about the current user participating in the chat.

// currentChannel: Information about the currently selected channel.

// messages: An array of messages in the current channel.

// sendMessage: A function to send a new message. The function takes a text parameter representing the content of the message.

// switchChannel: A function to switch to a different channel. It takes a channelId parameter specifying the ID of the channel to switch to.

// optionalProp: An optional prop that you can use for any additional data or configuration specific to the chat page.
