// Channel.ts

export interface Channel {
    id: string;
    name: string;
    description?: string;
    type: ChannelType;
    members: ChannelMember[];
    messages: ChannelMessage[];
  }
  
  export interface ChannelMember {
    userId: string;
    username: string;
    role: ChannelRole;
  }
  
  export interface ChannelMessage {
    messageId: string;
    userId: string;
    username: string;
    content: string;
    timestamp: Date;
  }
  
  export enum ChannelType {
    Public = 'public',
    Private = 'private',
    Audio = 'audio',
    Video = 'video',
    Text = 'text',
    SMS = 'sms',
    Email = "email",
    Chat= 'chat'
  }
  
  export enum ChannelRole {
    Owner = 'owner',
    Moderator = 'moderator',
    Member = 'member',
  }
  
""
// The Channel export interface represents a chat channel and includes properties like id, name, description, type, members, and messages.
// The ChannelMember export interface represents a member in a channel, with properties like userId, username, and role.
// The ChannelMessage export interface represents a message in a channel, with properties like messageId, userId, username, content, and timestamp.
// ChannelType is an enum representing the type of channel, either "public" or "private".
// ChannelRole is an enum representing the role of a channel member, either "owner," "moderator," or "member".
""
