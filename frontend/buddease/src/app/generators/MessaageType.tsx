// MessageType.tsx
import { Message } from "@/app/generators/GenerateChatInterfaces";

export enum MessageType {
  Success = "success",
  Error = "error",
  ProjectUpdate = "project_update",
  CollaborationRequest = "collaboration_request",
  CommunityEngagement = "community_engagement",
  DataInsights = "data_insights",
  AchievementsRewards = "achievements_rewards",
  PlatformUpdate = "platform_update",
  TrainingResources = "training_resources",
  FeedbackSuggestions = "feedback_suggestions",
  CommunitySupport = "community_support",
  PromotionalMessage = "promotional_message",
  Text = "text",
  Email = "email",
  MessageType = "text",
}

export function showMessageWithType(message: Message, type: MessageType) {
  // Create a new div element to hold the message
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  
  // Assign a specific property of the Message object to the messageDiv's textContent
  messageDiv.textContent = message.content;

  // Add class based on message type
  switch (type) {
    case MessageType.Success:
      messageDiv.classList.add('success');
      break;
    case MessageType.Error:
      messageDiv.classList.add('error');
      break;
    // Add cases for new message types
    case MessageType.ProjectUpdate:
      messageDiv.classList.add('project-update');
      break;
    case MessageType.CollaborationRequest:
      messageDiv.classList.add('collaboration-request');
      break;
    case MessageType.CommunityEngagement:
      messageDiv.classList.add('community-engagement');
      break;
    case MessageType.DataInsights:
      messageDiv.classList.add('data-insights');
      break;
    case MessageType.AchievementsRewards:
      messageDiv.classList.add('achievements-rewards');
      break;
    case MessageType.PlatformUpdate:
      messageDiv.classList.add('platform-update');
      break;
    case MessageType.TrainingResources:
      messageDiv.classList.add('training-resources');
      break;
    case MessageType.FeedbackSuggestions:
      messageDiv.classList.add('feedback-suggestions');
      break;
    case MessageType.CommunitySupport:
      messageDiv.classList.add('community-support');
      break;
    case MessageType.PromotionalMessage:
      messageDiv.classList.add('promotional-message');
      break;
    default:
      break;
  }

  // Append the messageDiv element to the body of the document
  document.body.appendChild(messageDiv);

  // Automatically remove the message after a certain duration (e.g., 3 seconds)
  setTimeout(() => {
    messageDiv.remove();
  }, 3000); // 3000 milliseconds = 3 seconds
}
