// questionnaireLogic.ts (create a new file)
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { OnboardingPhase } from '@/core/pages/personas/UserJourneyManager';
import axios from 'axios';

// Define a simplified UserData type for questionnaire submission
// Since questionnaire data doesn't need all generic parameters
interface QuestionnaireUserData {
  id?: string;
  username?: string;
  email?: string;
  questionnaireResponses: Record<string, any>;
  [key: string]: any;
}

// Type-safe handleQuestionnaireSubmit function
export const handleQuestionnaireSubmit = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  userResponses: Record<string, any>,
  userData: UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  setCurrentPhase: (phase: OnboardingPhase) => void,
  notify?: (notification: any) => void
): Promise<UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    // Create updated user data with questionnaire responses
    const updatedUserData: UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...userData,
      questionnaireResponses: {
        ...(userData.questionnaireResponses || {}),
        ...userResponses
      },
      updatedAt: new Date(),
      // Add any additional questionnaire-specific data
      ...(userData.questionnaireResponses ? {} : { 
        firstQuestionnaireCompleted: new Date(),
        questionnaireCompletionCount: 1 
      })
    };

    // Send responses to server
    const response = await axios.post('/api/questionnaire-submit', {
      userResponses,
      userId: userData.id,
      username: userData.username,
      timestamp: new Date().toISOString()
    });

    console.log('Server response:', response.data);

    // Save to localStorage with type safety
    const storageData = {
      ...updatedUserData,
      // Convert dates to strings for localStorage
      updatedAt: updatedUserData.updatedAt instanceof Date 
        ? updatedUserData.updatedAt.toISOString() 
        : updatedUserData.updatedAt,
      createdAt: updatedUserData.createdAt instanceof Date
        ? updatedUserData.createdAt.toISOString()
        : updatedUserData.createdAt,
      // Ensure questionnaireResponses is properly serialized
      questionnaireResponses: updatedUserData.questionnaireResponses || {}
    };

    localStorage.setItem('userData', JSON.stringify(storageData));

    // Transition to next phase
    setCurrentPhase(OnboardingPhase.OFFER);

    // Notify success if notify function provided
    if (notify) {
      notify({
        id: `questionnaire_submit_success_${userData.id || 'anonymous'}_${Date.now()}`,
        message: NOTIFICATION_MESSAGES.Onboarding?.QUESTIONNAIRE_SUBMITTED || 'Questionnaire submitted successfully',
        data: {
          entityType: 'user',
          entityId: userData.id || 'anonymous',
          action: 'questionnaire_submit',
          userId: userData.id,
          username: userData.username,
          responseCount: Object.keys(userResponses).length,
          timestamp: new Date().toISOString(),
          responseData: response.data
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const,
        metadata: {
          phase: 'onboarding',
          step: 'questionnaire',
          nextPhase: 'OFFER',
          hasQuestionnaireResponses: true,
          responseCount: Object.keys(userResponses).length
        }
      });
    }

    return updatedUserData;
    
  } catch (error: any) {
    console.error('Error sending questionnaire responses:', error);
    
    // Handle specific error types
    let errorMessage = 'Failed to submit questionnaire. Please try again.';
    let errorType = 'QUESTIONNAIRE_SUBMIT_ERROR';
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = 'Invalid questionnaire data provided.';
          errorType = 'VALIDATION_ERROR';
          break;
        case 401:
          errorMessage = 'Authentication required to submit questionnaire.';
          errorType = 'AUTH_ERROR';
          break;
        case 409:
          errorMessage = 'Questionnaire already submitted for this user.';
          errorType = 'DUPLICATE_SUBMISSION';
          break;
        case 422:
          errorMessage = 'Questionnaire validation failed. Please check your responses.';
          errorType = 'VALIDATION_ERROR';
          break;
        case 429:
          errorMessage = 'Too many submission attempts. Please try again later.';
          errorType = 'RATE_LIMIT_ERROR';
          break;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection and try again.';
      errorType = 'NETWORK_ERROR';
    }

    // Notify error if notify function provided
    if (notify) {
      notify({
        id: `questionnaire_submit_error_${userData.id || 'anonymous'}_${Date.now()}`,
        message: errorMessage,
        data: {
          entityType: 'user',
          entityId: userData.id || 'anonymous',
          action: 'questionnaire_submit',
          errorType,
          errorDetails: error.response?.data || error.message,
          userId: userData.id,
          username: userData.username,
          timestamp: new Date().toISOString(),
          statusCode: error.response?.status
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const,
        metadata: {
          phase: 'onboarding',
          step: 'questionnaire',
          isRetryable: true,
          requiresUserAction: true,
          errorType
        },
        action: {
          label: "Retry",
          onClick: () => handleQuestionnaireSubmit(userResponses, userData, setCurrentPhase, notify)
        }
      });
    }
    
    throw new Error(`${errorType}: ${errorMessage}`);
  }
};

// Simplified version for components that don't need all generic parameters
export const handleSimpleQuestionnaireSubmit = async (
  userResponses: Record<string, any>,
  userData: QuestionnaireUserData,
  setCurrentPhase: (phase: OnboardingPhase) => void,
  notify?: (notification: any) => void
): Promise<QuestionnaireUserData> => {
  try {
    // Create updated user data
    const updatedUserData: QuestionnaireUserData = {
      ...userData,
      questionnaireResponses: {
        ...(userData.questionnaireResponses || {}),
        ...userResponses
      }
    };

    // Send to server
    const response = await axios.post('/api/questionnaire-submit', {
      userResponses,
      userId: userData.id,
      timestamp: new Date().toISOString()
    });

    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(updatedUserData));

    // Transition phase
    setCurrentPhase(OnboardingPhase.OFFER);

    // Notify success
    if (notify) {
      notify({
        id: `questionnaire_simple_success_${userData.id || 'anonymous'}_${Date.now()}`,
        message: NOTIFICATION_MESSAGES.Onboarding?.QUESTIONNAIRE_SUBMITTED || 'Questionnaire submitted successfully',
        data: {
          entityType: 'user',
          entityId: userData.id || 'anonymous',
          action: 'questionnaire_submit',
          responseCount: Object.keys(userResponses).length,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    }

    return updatedUserData;
    
  } catch (error: any) {
    console.error('Error in simple questionnaire submission:', error);
    
    if (notify) {
      notify({
        id: `questionnaire_simple_error_${userData.id || 'anonymous'}_${Date.now()}`,
        message: 'Failed to submit questionnaire. Please try again.',
        data: {
          entityType: 'user',
          entityId: userData.id || 'anonymous',
          action: 'questionnaire_submit',
          error: error.message,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
    
    throw error;
  }
};

// Factory function to create questionnaire handlers with specific user types
export const createQuestionnaireHandler = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  setCurrentPhase: (phase: OnboardingPhase) => void,
  notify?: (notification: any) => void
) => {
  return async (
    userResponses: Record<string, any>,
    userData: UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    return handleQuestionnaireSubmit(
      userResponses,
      userData,
      setCurrentPhase,
      notify
    );
  };
};

// Helper function to extract questionnaire responses from user data
export const extractQuestionnaireResponses = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  userData: UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Record<string, any> => {
  return userData.questionnaireResponses || {};
};

// Helper function to check if questionnaire is completed
export const isQuestionnaireCompleted = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  userData: UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): boolean => {
  const responses = userData.questionnaireResponses || {};
  return Object.keys(responses).length > 0;
};