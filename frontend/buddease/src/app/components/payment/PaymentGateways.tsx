// PaymentGateways.ts

// Import necessary functions
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { addMessage } from '../state/redux/slices/ChatSlice';
import { initiateBitcoinPayment, initiateEthereumPayment } from './initCryptoPayments';
import { ProfileAccessControl } from '@/app/pages/profile/Profile';
import { UserSettings } from '@/app/configs/UserSettings';
import { NotificationSettings } from '../support/NotificationSettings';
import { Persona } from '@/app/pages/personas/Persona';
import { UserRole } from '../users/UserRole';
import { handleCryptoPaymentSelect } from '../event/DynamicEventHandlerExample';
import { Writable } from 'stream';
import { WritableDraft } from '../state/redux/ReducerGenerator';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';

// Function to handle payment selection and initiate payment process
export const handlePaymentSelection = (cryptoOption: string) => {
  switch (cryptoOption) {
    case 'Bitcoin':
      initiateBitcoinPayment();
      break;
    case 'Ethereum':
      initiateEthereumPayment();
      break;
    default:
      // Handle other payment options here
      break;
  }
};

// Function to handle crypto payment selection from payments component
export const handleCryptoPaymentSelection = (cryptoOption: string) => {
  handleCryptoPaymentSelect(cryptoOption);
};


const generatePaymentId = UniqueIDGenerator.generatePaymentId()
// Function to add payment-related message to chat
export const addPaymentMessageToChat = (cryptoOption: string) => {
  // Create a message object that conforms to the Message interface
  const paymentMessage: WritableDraft<Message> = {
    
    username: '',  // Set appropriate value
    firstName: '',  // Set appropriate value
    lastName: '',  // Set appropriate value
    email: '',  // Set appropriate value
    tier: '',  // Set appropriate value
    token: '',  // Set appropriate value
    uploadQuota: 0,  // Set appropriate value
    avatarUrl: '',  // Set appropriate value
    fullName: '',  // Set appropriate value
    roles: [],  // Set appropriate roles
    userType: '',  // Set appropriate value
    hasQuota: false,  // Set appropriate value (true/false)
    profilePicture: '',  // Set appropriate value
    processingTasks: [],  // Set appropriate value
    role: {} as UserRole,  // Set appropriate value
    persona: {} as Persona,  // Set appropriate value

    id: generatePaymentId,  // Assuming you have a method to generate a unique payment ID
    sender: undefined,        // Populate with appropriate sender information
    senderId: undefined,      // Populate with appropriate sender ID
    channel: undefined,       // Populate with appropriate channel info
    channelId: undefined,     // Populate with appropriate channel ID
    content: `Payment initiated with ${cryptoOption}`,  // Customize content
    additionalData: undefined,
    tags: [],                 // Add relevant tags if any
    userId: undefined,
    timestamp: new Date(),
    text: `Payment initiated with ${cryptoOption}`,  // This should match the content
    isUserMessage: false,
    receiver: undefined,      // Populate with appropriate receiver information
    isOnline: true,           // Set this based on actual online status
    lastSeen: new Date(),
    description: undefined,
    createdAt: new Date(),    // Set current date as createdAt
    updatedAt: new Date(),     // Set current date as updatedAt
    deletedAt: null,
    imageUrl: '',             // Set to default or actual image URL if needed
    bio: null,
    website: '',
    location: '',
    coverImageUrl: '',
    following: [],
    followers: [],
    chatRooms: [],            // Populate if there are chat rooms associated
    blockedUsers: [],
    blockedBy: [],

    friends: [],  // Set appropriate value
    settings: {} as UserSettings,  // Set appropriate value (use the correct type for settings)
    interests: [],  // Set appropriate value
    privacySettings: {},  // Set appropriate value
    notifications: {} as NotificationSettings,  // Set appropriate value
    activityLog: [],  // Set appropriate value
    socialLinks: {},  // Set appropriate value
    relationshipStatus: '',  // Set appropriate value
    hobbies: [],  // Set appropriate value
    skills: [],  // Set appropriate value
    achievements: [],  // Set appropriate value
    profileVisibility: '',  // Set appropriate value
    profileAccessControl: {} as ProfileAccessControl,  // Set appropriate value
    activityStatus: '',  // Set appropriate value
    isAuthorized: false,  // Set appropriate value (true/false)
    preferences: {},  // Set appropriate value (use the correct type for preferences)
    storeId: 0,  // Set appropriate value
    
  };

  // Add the message to the chat using the addMessage function
  addMessage(paymentMessage);
};
